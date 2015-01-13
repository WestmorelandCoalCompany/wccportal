define(['backbone'], function() {
	var Base = function() {};
 
	// Use the regular Backbone extend, but tag methods with their name
	Base.extend = function() {
	  var Subclass = Backbone.Model.extend.apply(this, arguments);
	  _.each(Subclass.prototype, function(value, name) {
	    if (_.isFunction(value)) {
	      value._methodName = name;
	    }
	  });
	  return Subclass;
	};
	 
	// Define a special `super` property that locates the super implementation of the caller
	Object.defineProperty(Base.prototype, "super", {
	  get: function get() {
	    var impl = get.caller,
	      name = impl._methodName,
	      foundImpl = this[name] === impl,
	      proto = this;
	 
	    while (proto = Object.getPrototypeOf(proto)) {
	      if (!proto[name]) {
	        break;
	      } else if (proto[name] === impl) {
	        foundImpl = true;
	      } else if (foundImpl) {
	        return proto[name];
	      }
	    }
	 
	    if (!foundImpl) throw "`super` may not be called outside a method implementation";
	  }
	});
});