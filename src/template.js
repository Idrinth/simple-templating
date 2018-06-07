"use strict";
(() => {
    /**
     * @package
     * @type {ValueCache}
     */
    class ValueCache {
        /**
         * @public
         * @constructor
         * @param {String} name
         */
        constructor (name)
        {
            this.cached = name;
            this.uncached = name.split(".");
        }
        /**
         * @private
         * @param {Object} values
         * @return {String}
         */
        find ( values )
        {
            let cur = values;
            for (let key of this.uncached) {
                if (typeof cur[key] === "undefined") {
                    return "";
                }
                cur = cur[key];
            }
            return cur;
        }
        /**
         * @protected
         * @param {Object} values
         * @return {Mixed}
         */
        retrieve ( values )
        {
            if (this.uncached.length === 1) {
                return values[this.cached];
            }
            if (typeof values._cache[this.cached] === "undefined") {
                values._cache[this.cached] = this.find( values );
            }
            return values._cache[this.cached];
        }
    }
    /**
     * @package
     * @type {ConditionTag}
     */
    class ConditionTag extends ValueCache
    {
        /**
         * @public
         * @constructor
         * @param {String} name
         * @param {BodyTag|Template} body
         * @return {ConditionTag}
         */
        constructor ( name, body )
        {
            let inverted = name.charAt(0) === "!";
            super(inverted ? name.substr( 1 ) : name);
            this.body = body;
            this.inverted = inverted;
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            if ( (!!this.retrieve( values )) === this.inverted ) {
                return "";
            }
            return this.body.render ( values );
        }
    }
    /**
     * @package
     * @type {EachTag}
     */
    class EachTag extends ValueCache
    {
        /**
         * @public
         * @constructor
         * @param {String} list
         * @param {BodyTag|Template} body
         * @return {EachTag}
         */
        constructor ( list, body )
        {
            super (list);
            this.body = body;
            this.list = list;
        }
        /**
         * @private
         * @param {mixed} obj
         * @return {mixed}
         */
        clone(obj)
        {
            if(typeof obj !== "object" || obj === null) {
                return obj;
            }
            if (obj.constructor === Array) {
                let nA = new Array(obj.length);
                for (let i = obj.length - 1; i >= 0; i--) {
                    nA[i] = this.clone(obj[i]);
                }
                return nA;
            }
            let nO = {};
            for (let p in obj) {
                nO[p] = this.clone(obj[p]);
            }
            return nO;
        }
        /**
         * @private
         * @param {Object} options
         * @param {Object|Array} list
         * @param {String|Number} key
         * @param {Number} pos
         * @return {String}
         */
        renderPart ( options, list, key, pos )
        {
            options["_" + this.list] = {
                key,
                value: list[key],
                even: !( pos % 2),
                pos
            };
            for (let prop in options["_" + this.list]) {
                options._cache["_" + this.list+"."+prop] = options["_" + this.list][prop];
            }
            return this.body.render ( options );
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            let list = this.retrieve ( values );
            if ( !list ) {
                return "";
            }
            if ( typeof list !== "object" ) {
                return "";
            }
            let out = "";
            let options = this.clone ( values );
            if(list.constructor === Array) {
                for (let pos = 0; pos < list.length; pos++) {
                    out += this.renderPart ( options, list, pos, pos );
                }
                return out;
            }
            let pos = 0;
            for (let key in list) {
                out += this.renderPart ( options, list, key, pos );
                pos++;
            }
            return out;
        }
    }
    /**
     * @package
     * @type {ValueTag}
     */
    class ValueTag extends ValueCache
    {
        /**
         * @public
         * @constructor
         * @param {String} name
         * @return {ValueTag}
         */
        constructor (name)
        {
            super(name);
        }
        /**
         * @private
         * @param {String} match
         * @return {String}
         */
        replaceMatch ( match )
        {
            switch ( match ) {
                case "&":
                    return "&amp;";
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "\"":
                    return "&quot;";
                case "'":
                    return "&#039;";
                default:
                    return match;
            }
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            return ( this.retrieve( values ) + "" ).replace ( /[&<"'>]/g, this.replaceMatch );
        }
    }
    /**
     * @package
     * @type {TextTag}
     */
    class TextTag
    {
        /**
         * @public
         * @constructor
         * @param {String} string
         * @return {TextTag}
         */
        constructor (string)
        {
            this.string = string;
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            return this.string;
        }
    }
    /**
     * @package
     * @type {BodyTag}
     */
    class BodyTag
    {
        /**
         * @public
         * @constructor
         * @param {String} content
         * @return {BodyTag}
         */
        constructor ( content )
        {
            this.parts = [];
            if (typeof content === "string" && content.length > 0) {
                let pos = -1;
                while ((pos = content.indexOf( "{{" )) > -1) {
                    if (pos > 0) {
                        this.parts.push(new TextTag(content.substr(0, pos)));
                        content = content.substr(pos);
                    }
                    let end = content.indexOf( "}}" );
                    let tag = content.substr(2, end-2);
                    content = content.substr(end+2);
                    this.parts.push(new ValueTag(tag));
                }
                this.parts.push(new TextTag(content));
            }
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            let out = "";
            for (let tag of this.parts) {
                out += tag.render(values);
            }
            return out;
        }
    }
    /**
     * @package
     * @type {Template}
     */
    class Template
    {
        /**
         * @public
         * @constructor
         * @param {String} code
         * @return {Template}
         */
        constructor ( code )
        {
            this.parts = [ ];
            let pos = 0;
            while ( ( pos = code.indexOf ( "{%" ) ) > -1 ) {
                if ( pos > 0 ) {
                    this.parts.push ( new BodyTag ( code.substring ( 0, pos ) ) );
                }
                code = code.substring ( pos + 2 );
                let pos2 = code.indexOf ( "%}" );
                let def = ( code.substring ( 0, pos2 ) ).split ( " " );
                let pos3 = this.findEnd ( code, pos2 + 2 );
                this.addToParts ( def[0], def[1], new Template ( code.substring ( pos2 + 2, pos3 ) ) );
                code = code.substring ( pos3 + 7 );
            }
            this.parts.push ( new BodyTag ( code ) );
        }
        /**
         * @private
         * @param {String} name
         * @param {String} value
         * @param {Template} body
         * @return {void}
         */
        addToParts ( name, value, body )
        {
            if ( name === "each" ) {
                return this.parts.push ( new EachTag ( value, body ) );
            }
            if ( name === "if" ) {
                return this.parts.push ( new ConditionTag ( value, body ) );
            }
            throw new Error ( "Token " + name + " is invalid." );
        }
        /**
         * @private
         * @param {String} tag
         * @return {Number} the level-adjustment
         * @throws {Error} if unknown tokens appear or no end is found
         */
        adjustmentForTag ( tag )
        {
            return ( tag === "each" || tag === "if" ) ? 1 : -1;
        }
        /**
         * @private
         * @param {String} code
         * @param {Number} pos
         * @return {Number} the end position
         * @throws {Error} if unknown tokens appear or no end is found
         */
        findEnd ( code, pos )
        {
            let pos2 = pos;
            let ins = 1;
            while ( ( pos = code.indexOf ( "{%", pos2 ) ) > -1 ) {
                pos2 = code.indexOf ( "%}", pos );
                let def = ( code.substring ( pos + 2, pos2 ) ).split ( " " );
                ins += this.adjustmentForTag(def[0]);
                if ( ins === 0 ) {
                    return pos;
                }
                pos2 += 2;
            }
            throw new Error ( "can't find end." );
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            values._cache = {};
            let content = "";
            for (let pos = 0; pos < this.parts.length; pos++) {
                content += this.parts[pos].render ( values );
            }
            return content;
        }
    }
    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = Template;
    } else if (typeof define === "function" && define.amd) {
        define([], () => {
            return Template;
        });
    } else if(self||window||global||this) {
        (self||window||global||this).Template = Template;
    } else {
        throw new Error( "nothing to attach to found" );
    }
})();