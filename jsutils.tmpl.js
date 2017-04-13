(function (foo) {
    //Check Dependencies
    switch (undefined) {
        case foo._define_ :
        case foo._module_ :
            throw "include webmodules-foo/define.js";
        case foo._ :
            console.warn("include webmodules-underscore/underscore.js");
    }
    ;
    return _define_;
})(this)("jsutils.tmpl", function (tmpl) {

    "use strict";
    var TAG_RESOLVERS = [], INTERCEPT_RESOLVERS = [];

    // List of HTML entities for escaping.
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
    var escapeChar = function (match) {
        return '\\' + escapes[match];
    };

    // following template settings to use alternative delimiters.
    // evaluate : /<%([\s\S]+?)%>/g,
    // interpolate : /<%=([\s\S]+?)%>/g,
    // escape : /<%-([\s\S]+?)%>/g
    var _tmpl = {
        // Functions for escaping and unescaping strings to/from HTML
        // interpolation.
        escape: (function (map) {
            var escaper = function (match) {
                return map[match];
            };
            // Regexes for identifying a key that needs to be escaped
            var source = '(?:' + Object.keys(map).join('|') + ')';
            var testRegexp = RegExp(source);
            var replaceRegexp = RegExp(source, 'g');
            return function (string) {
                string = string == null ? '' : '' + string;
                return testRegexp.test(string) ? string.replace(replaceRegexp,
                        escaper) : string;
            };
        })(escapeMap),
        templateSettings: {
            evaluate: /<!--\ ([\s\S]+?)\ -->/g,
            interpolate: /{{([\s\S]+?)}}/g, //interpolate: /{{([\s\S]+?)}}/g,
            escape: /<!--\\([\s\S]+?)-->/g,
            variable: 'data'
        },
        __undescore_template_resolver_: function (file_name, data) {
            if (TEMPLATES[file_name]) {
                return TEMPLATES[file_name](data);
            } else if (file_name) {
                return "NO TEMPLATE FOUND:" + file_name;
            } else
                return "";
        },
        _format_: function (value, str) {
            var formatters = str.replace(/ /g, "").split("|");
            value = this._prefilter_(value);
            for (var i in formatters) {
                if (is.Function(this._formatter_[formatters[i]])) {
                    value = this._formatter_[formatters[i]](value);
                }
            }
            return value;
        },
        _function_: function (funName, args) {
            var formatters = funName.replace(/ /g, "").split("|");
            args[0] = this._prefilter_(args[0]);
            var value = this._formatter_[formatters[0]].apply(this._formatter_, args);
            for (var i = 1; i < formatters.length; i++) {
                if (is.Function(this._formatter_[formatters[i]])) {
                    value = this._formatter_[formatters[i]](value);
                }
            }
            return value;
        },
        _prefilter_: function (str) {
            // if (is.String(str)) {
            //     return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // }
            return str;
        },
        _formatter_: {
            uppercase: function (value) {
                return (value + "").toUpperCase();
            },
            lowercase: function (value) {
                return (value + "").toLowerCase();
            }
        },
        _tags_: function (tagString) {
            var tags = tagString.replace(/\s+/g, " ").split(" ");
            for (var i in TAG_RESOLVERS) {
                tags = tags.filter(function (tagName) {
                    return !TAG_RESOLVERS[i](tagName)
                });
            }
        }
    };
    tmpl.formatter = function (name, handler) {
        _tmpl._formatter_[name] = handler;
    };

    tmpl.tags = function (resolver) {
        TAG_RESOLVERS.push(resolver);
        return tmpl;
    };
    tmpl.tags(function (tagName) {
        //override this funntion
        //for ja-tags
        if (tagName.indexOf("jq-") === 0) {
            module(tagName.replace("jq-", "jqtags."));
            return true;
        }
    });

    tmpl.intercept = function (handler) {
        INTERCEPT_RESOLVERS.push(handler);
        return tmpl;
    };
    tmpl.prefilter = function (_prefilter_) {
        _tmpl._prefilter_ = _prefilter_;
        return tmpl;
    };

    tmpl._intercept_ = function (template) {
        for (var i in INTERCEPT_RESOLVERS) {
            template = INTERCEPT_RESOLVERS[i](template);
        }
        return template;
    };

    tmpl.intercept(function (template) {
        template = template
            .replace(/\{\{\#/g, "_tmpl_prefilter_hash_")
            .replace(/\{\{\$/g, "_tmpl_prefilter_dollar_")
            .replace(/\{\{/g, "{{_tmpl_prefilter_")
            .replace(/_tmpl_prefilter_hash_/g, "{{#")
            .replace(/_tmpl_prefilter_dollar_/g, "{{$")
            .replace(/\{\{\_tmpl_prefilter_([^|}]*)([^}]*)\}\}/g, "{{_tmpl._prefilter_($1$2)}}");


        template = template.replace(/\{\{\#([^|}]*)([^}]*)\}\}/g, "{{_tmpl._format_( $1, '$2')}}");
        template = template.replace(/\{\{\$([^\()}]*)\(([^}]*)(\))\}\}/g, "{{_tmpl._function_('$1',[$2])}}");

        template = template.replace(/<_if\sexp=\"(.*?)\"\s*>/g, "<!-- if($1){ -->");
        template = template.replace(/<_if\s(.*?)\s*>/g, "<!-- if($1){ -->");

        template = template.replace(/<_elseif\exp=\"(.*?)\"\s*\/>/g, "<!-- } else if($1){ -->");
        template = template.replace(/<_elseif\s(.*?)\s*\/>/g, "<!-- } else if($1){ -->");

        template = template.replace(/<_else\s*\/>/g, "<!-- } else { -->");
        template = template.replace(/\<\/_if?>/g, "<!-- } -->");

        template = template.replace(/<_for\sexp=\"(.*?)\"\s*>/g, "<!-- for($1){ -->");
        template = template.replace(/<_for\s(.*?)\s*>/g, "<!-- for($1){ -->");
        template = template.replace(/\<\/_for?>/g, "<!-- } -->");

        template = template.replace(/<_forEach\sexp=\"var\s*(.+)\s*[,\s](.+)\sin\s(.+)\"\s*>/g, "<!-- _.forEach($3,function($2,$1){ -->");
        template = template.replace(/<_forEach\svar\s*(.+)\s*[,\s](.+)\sin\s(.+)\s*>/g, "<!-- _.forEach($3,function($2,$1){ -->");

        template = template.replace(/<_forEach\sexp=\"var\s(.+)\sin\s(.+)\"\s*>/g, "<!-- _.forEach($2,function(undefined,$1){ -->");
        template = template.replace(/<_forEach\svar\s*(.+)\sin\s(.+)\s*>/g, "<!-- _.forEach($2,function(undefined,$1){ -->");

        template = template.replace(/\<\/_forEach?>/g, "<!-- }) -->");

        return template.replace(/\<_tags\s*(.*)?\/>/g, "<!-- _tmpl._tags_('$1'); -->");
    });


    tmpl.parse = function (template, data) {
        return this.compile(template)(data);
    };

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    // NB: `oldSettings` only exists for backwards compatibility.
    tmpl.compile = function (text, settings, oldSettings) {
        if (!settings && oldSettings)
            settings = oldSettings;
        settings = mixin(mixin({}, _tmpl.templateSettings), settings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([(settings.escape || noMatch).source,
                (settings.interpolate || noMatch).source,
                (settings.evaluate || noMatch).source].join('|')
            + '|$', 'g');


        text = tmpl._intercept_(text);
        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escapeRegExp,
                escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape
                    + "))==null?'':_tmpl.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offset.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable)
            source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join,"
            + "print=function(){__p+=__j.call(arguments,'');};\n" + source
            + 'return __p;\n';

        var render;
        try {
            render = new Function(settings.variable || 'obj', '_tmpl', '__', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function (data) {
            return render.call(this, data, _tmpl, settings);
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    };

});
