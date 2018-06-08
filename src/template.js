"use strict";
((outer) => {
    const UNDEFINED = "undefined";
    const OBJECT = "object";
    const LOOP = "each";
    const CONDITION = "if";
    const LOGIC_START = "{%";
    const LOGIC_END = "%}";
    const EMPTY_STRING = "";
    const SEPARATOR = ".";
    const LOOP_VARS = {
        key: "key",
        value: "value",
        position: "pos",
        even: "even"
    };
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
            this.uncached = name.split(SEPARATOR);
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
                if (typeof cur[key] === UNDEFINED) {
                    return EMPTY_STRING;
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
            if (typeof values._cache[this.cached] === UNDEFINED) {
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
                return EMPTY_STRING;
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
            this.prefixed = "_"+list.replace(SEPARATOR, "#");
        }
        /**
         * @private
         * @param {mixed} obj
         * @return {mixed}
         */
        cloneArray(arr)
        {
            let nA = new Array(arr.length);
            for (let i = arr.length - 1; i >= 0; i--) {
                nA[i] = this.clone(arr[i]);
            }
            return nA;
        }
        /**
         * @private
         * @param {mixed} obj
         * @return {mixed}
         */
        cloneObject(obj)
        {
            let nO = {};
            for (let p in obj) {
                nO[p] = this.clone(obj[p]);
            }
            return nO;
        }
        /**
         * @private
         * @param {mixed} mixed
         * @return {mixed}
         */
        clone(mixed)
        {
            if(typeof mixed !== OBJECT || mixed === null) {
                return mixed;
            }
            if (mixed.constructor === Array) {
                return this.cloneArray(mixed);
            }
            return this.cloneObject(mixed);
        }
        /**
         * @private
         * @param {Object} options
         * @param {Object|Array} list
         * @param {String|Number} key
         * @param {Number} position
         * @return {String}
         */
        renderPart ( options, list, key, position )
        {
            let local = {};
            local[LOOP_VARS.key] = key;
            local[LOOP_VARS.value] = list[key];
            local[LOOP_VARS.position] = position;
            local[LOOP_VARS.even] = !( position % 2);
            for (let prop in LOOP_VARS) {
                options._cache[this.prefixed+SEPARATOR+prop] = local[prop];
            }
            options[this.prefixed] = local;
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
                return EMPTY_STRING;
            }
            if ( typeof list !== OBJECT ) {
                return EMPTY_STRING;
            }
            let params = [list, this.clone ( values ), EMPTY_STRING];
            if (list.constructor === Array ) {
                this.renderArray(...params);
            }
            return this.renderObject(...params);
        }
        /**
         * @public
         * @param {Array} list
         * @param {Object} values
         * @param {String} out
         * @return {String}
         */
        renderArray (list, options, out)
        {
            for (let pos = 0; pos < list.length; pos++) {
                out += this.renderPart ( options, list, pos, pos );
            }
            return out;
        }
        /**
         * @public
         * @param {Object} list
         * @param {Object} options
         * @param {String} out
         * @return {String}
         */
        renderObject (list, options, out)
        {
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
            return ( this.retrieve( values ) + EMPTY_STRING ).replace ( /[&<"'>]/g, this.replaceMatch );
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
            this.parts = this.contentToParts( content );
        }
        /**
         * @param {String} content
         * @return {Array.<TextTag|ValueTag>}
         */
        contentToParts ( content )
        {
            if (!content || typeof content !== "string") {
                return [];
            }
            let parts = [];
            let pos = -1;
            while ((pos = content.indexOf( "{{" )) > -1) {
                if (pos > 0) {
                    parts.push(new TextTag(content.substr(0, pos)));
                    content = content.substr(pos);
                }
                let end = content.indexOf( "}}" );
                let tag = content.substr(2, end-2);
                content = content.substr(end+2);
                parts.push(new ValueTag(tag));
            }
            parts.push(new TextTag(content));
            return parts;
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            let out = EMPTY_STRING;
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
            while ( ( pos = code.indexOf ( LOGIC_START ) ) > -1 ) {
                if ( pos > 0 ) {
                    this.parts.push ( new BodyTag ( code.substring ( 0, pos ) ) );
                }
                code = code.substring ( pos + 2 );
                let pos2 = code.indexOf ( LOGIC_END );
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
            if ( name === LOOP ) {
                return this.parts.push ( new EachTag ( value, body ) );
            }
            if ( name === CONDITION ) {
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
            return ( tag === LOOP || tag === CONDITION ) ? 1 : -1;
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
            while ( ( pos = code.indexOf ( LOGIC_START, pos2 ) ) > -1 ) {
                pos2 = code.indexOf ( LOGIC_END, pos );
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
            let content = EMPTY_STRING;
            for (let pos = 0; pos < this.parts.length; pos++) {
                content += this.parts[pos].render ( values );
            }
            return content;
        }
    }
    if (typeof module !== UNDEFINED && typeof module.exports !== UNDEFINED) {
        return module.exports = Template;
    }
    if (typeof define === "function" && define.amd) {
        return define([], () => {
            return Template;
        });
    }
    ((outer) => {
        if(typeof self !== UNDEFINED) {
            return self;
        }
        if(typeof window !== UNDEFINED) {
            return window;
        }
        if(typeof global !== UNDEFINED) {
            return global;
        }
        if(typeof outer !== UNDEFINED) {
            return outer;
        }
        throw new Error( "nothing to attach to found" );
    })(outer).Template = Template;
})(this);