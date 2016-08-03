/*
 * Implementation notes:
 * 
 */

define(['q'], function (Q) {

  /**
   * Represents a dependency node. For each dependency instance, there's a
   * separate node. That is, if a module 'client:mod1' is specified as a
   * dependency in two different modules, each will have it's own associated
   * instance.
   */
  function Dependency(compSpec, prnt) {
    var module,
        circularPath;
    this._id = compSpec;
    this._chldrn = [];
    this._prnt = prnt;
    if (prnt instanceof Dependency) {
      prnt.addChild(this);
    }

    if ((circularPath = this.checkCircularDependency())) {
      throw 'Circular dependency: ' + circularPath;
    }

    Object.defineProperty(this, 'module', {
      get: function () {
        return module;
      },
      set: function (mod) {
        module = mod;
      }
    });

  }

  Dependency.prototype = Object.create(null);
  Dependency.prototype.constuctor = Dependency;

  Dependency.prototype.addChild = function addChild(chld) {
    this._chldrn.push(chld);
  };

  Dependency.prototype.toString = function toString() {
    return this._id;
  }

  Dependency.prototype.print = function (indent) {
    indent = indent === undefined ? '' : indent + '    ';
    var result = indent + this.toString() + ': [\n';
    this._chldrn.forEach(function (chld) {
      result += chld.print(indent);
    });
    result += indent + ']\n';
    return result;
  };

  Dependency.prototype.checkCircularDependency = function (node) {
    if (!node) {
      node = this;
    }
    var cprnt = node._prnt,
        path = '' + this;
    while (cprnt) {
      path = cprnt + ' => ' + path;
      if (cprnt._id === node._id) {
        return path;
      }
      cprnt = cprnt._prnt;
    }
    return undefined;
  }

  Dependency.prototype.isLeaf = function isLeaf() {
      return this._chldrn.length === 0;
  };

  Dependency.prototype.isRoot = function isRoot() {
      return this._prnt === undefined;
  };

  var deps= {},     // dictionary: module id to module
      roots = [],   // array: root modules (loaded by the application)
      inits = {};

  var components = {};

  // reorganize _xdk.clientComponents for easier access
  if (xdk_.clientComponents) {
    xdk_.clientComponents.forEach(function (o) {
      if (!o.name) {
        throw 'Components object malformed: ' + JSON.strinfigy(o);
      }
      components[o.name] = o;
    });
  }

  
  function _loadComponent(compSpec, parentDependency) {
    var spec,
        type,
        name,
        isSoft,
        path,
        loadDeferred = Q.defer(), // when this component is loaded
        deferred = Q.defer(), // when all the components are loaded recursively
        dependencies = [],
        depNode;

    if (!compSpec || typeof compSpec !== 'string') {
      throw 'Component specification is not a string: ' + compSpec;
    }

    spec = compSpec.split(':');

    if (spec.length < 2) {
      throw 'Module name is incorrect: ' + name;
    }

    type = spec[0];

    if (type !== xdk_.type) {
      throw 'Requested loading ' + type + ' while running ' + xdk_.type;
    }

    name = spec[1];
    isSoft = spec[2] === 'soft';
    compSpec = spec[0] + ':' + spec[1];
    if (!components[name]) {
      if (isSoft) {
        loadDeferred.resolve(undefined);
        deferred.resolve();
        return;
      } else {
        throw 'Component ' + compSpec + ' is uknown';
      }
    }
    path = components[name].path;

    deps[compSpec] = loadDeferred.promise;

    depNode = new Dependency(compSpec, parentDependency);
    if (parentDependency === undefined) {
      roots.push(depNode);
    }

    require([path], function (o) {
        var init;

        console.log('Module ' + compSpec + ' is loaded', o);

        // check the component API is present and is correctly defined
        if (!o || !o.name || !o.init) {
          throw 'Component ' + compSpec + ' does not define required API.  Returns ' + 
            JSON.stringify(o) + ' instead.';
        }

        init = o.init;
        if (typeof init !== 'object' || init.length !== 2 || typeof init[0] !== 'object' ||
            typeof init[1] !== 'function') {

          throw 'Component should define init in form of [[deps...], function ()]';
        }
        init[0].forEach(function (dep) {
            dependencies.push(_loadComponent(dep, depNode));
        });
        loadDeferred.resolve(o);
        Q.all(dependencies)
            .done(function () {
                deferred.resolve();
            });
      }, function (err) {
        console.log('Error loading ' + compSpec + ': ' + err);
        loadDeferred.reject();
      });

    return deferred.promise;
  }

  function load(compSpec) {
    return _loadComponent(compSpec, undefined)
      .done(function () {
        console.log('Root component ' + compSpec + ' is loaded.');
        console.log('Roots: ' + roots.length);
        roots.forEach(function (root) {
          console.log(root.print());
        });
      });
  }

  return {
    load: load
  };

});
