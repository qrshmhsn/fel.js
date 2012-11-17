var templater = require("handlebars-browserify");

//add inheritance helpers
templater.loadPartial = function loadPartial(name) {
    var partial = templater.partials[name];
    if (typeof partial === "string") {
        partial = templater.compile(partial);
        templater.partials[name] = partial;
    }
    return partial;
};
var renderInherited = function renderInherited(context, name, saved, child, parent) {
    templater.registerPartial(name, parent);
    var out = child(context);
    templater.registerPartial(name, saved);
    return out;
};
templater.registerHelper("override", function override(name, options) {
    /* Would be nice to extend Handlebars so that the blocks dictionary would reset at every top-level instantiation, or better yet, pass it around in the options (instead of using a module-level variable). To avoid such invasion, though, we check to initialize before every use, and clear after all uses finished. */
    var blocks = templater.blocks = templater.blocks || {};
    var override = blocks[name];
    var parent = options.fn;
    if (override) {
        var wrapper = function wrapper(context) {
            var grandparent = templater.loadPartial(name);
            var parentWrapper = function parentWrapper(subcontext) {
                return renderInherited(/*context=*/subcontext, name,
                                       /*saved=*/parentWrapper,
                                       /*child=*/parent,
                                       /*parent=*/grandparent);
            };
            return renderInherited(context, name,
                                   /*saved=*/grandparent,
                                   /*child=*/override,
                                   /*parent=*/parentWrapper);
        };
    } else {
        var wrapper = parent;
    }
    blocks[name] = wrapper;
});
templater.registerHelper("block", function block(name, options) {
    var blocks = templater.blocks = templater.blocks || {};
    var override = blocks[name];
    if (override) {
        /* We let templates include parent blocks with regular partials---e.g., `{{> parent}}`---but we cannot "store" the blocks as partials - we have to discriminate between blocks and partials so that we can clear the former but not the latter at the end of every top-level instantiation. */
        var out = renderInherited(/*context=*/this, name,
                                  /*saved=*/undefined,
                                  /*child=*/override,
                                  /*parent=*/options.fn);
    } else {
        var out = options.fn(this);
    }

    return out;
});
templater.registerHelper("extend", function extend(name) {
    var base = templater.loadPartial(name);
    var out = base(this);
    delete templater.blocks;
    return new templater.SafeString(out);
});
//logic helpers
/**
 * If Equals
 * if_eq this compare=that
 */
templater.registerHelper('if_eq', function(left, right, options) {
	if (left == right)
		return options.fn(this);
	return options.inverse(this);
});
/**
 * Unless Equals
 * unless_eq this compare=that
 */
templater.registerHelper('unless_eq', function(left, right, options) {
	if (left == right)
		return options.inverse(this);
	return options.fn(this);
});
/**
 * If Greater Than
 * if_gt this compare=that
 */
templater.registerHelper('if_gt', function(left, right, options) {
	if (left > right)
		return options.fn(this);
	return options.inverse(this);
});
/**
 * Unless Greater Than
 * unless_gt this compare=that
 */
templater.registerHelper('unless_gt', function(left, right, options) {
	if (left > right)
		return options.inverse(this);
	return options.fn(this);
});
/**
 * If Less Than
 * if_lt this compare=that
 */
templater.registerHelper('if_lt', function(left, right, options) {
	if (left < right)
		return options.fn(this);
	return options.inverse(this);
});
/**
 * Unless Less Than
 * unless_lt this compare=that
 */
templater.registerHelper('unless_lt', function(left, right, options) {
	if (left < right)
		return options.inverse(this);
	return options.fn(this);
});
/**
 * If Greater Than or Equal To
 * if_gteq this compare=that
 */
templater.registerHelper('if_gteq', function(left, right, options) {
	if (left >= right)
		return options.fn(this);
	return options.inverse(this);
});
/**
 * Unless Greater Than or Equal To
 * unless_gteq this compare=that
 */
templater.registerHelper('unless_gteq', function(left, right, options) {
	if (left >= right)
		return options.inverse(this);
	return options.fn(this);
});
/**
 * If Less Than or Equal To
 * if_lteq this compare=that
 */
templater.registerHelper('if_lteq', function(left, right, options) {
	if (left <= right)
		return options.fn(this);
	return options.inverse(this);
});
/**
 * Unless Less Than or Equal To
 * unless_lteq this compare=that
 */
templater.registerHelper('unless_lteq', function(left, right, options) {
	if (left <= right)
		return options.inverse(this);
	return options.fn(this);
});