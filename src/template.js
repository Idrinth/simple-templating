(function () {
    /**
     * @package
     * @type {ConditionTag}
     */
    class ConditionTag
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
            this.body = body;
            this.inverted = name.charAt(0) === "!";
            this.name = name.substr( this.inverted ? 1 : 0 ).split( "." );
        }
        /**
         * @private
         * @param {Object} values
         * @return {Boolean}
         */
        isValid ( values )
        {
            let cur = values;
            for ( let key of this.name ) {
                if ( !cur[key] ) {
                    return false;
                }
                cur = cur[key];
            }
            return !!cur;
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            if ( this.isValid ( values ) === this.inverted ) {
                return "";
            }
            return this.body.render ( values );
        }
    }
    /**
     * @package
     * @type {EachTag}
     */
    class EachTag
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
            this.body = body;
            this.list = list;
        }
        /**
         * @private
         * @param {Object} values
         * @param {Object|Array} list
         * @param {String|Number} key
         * @param {Number} pos
         * @return {String}
         */
        renderPart ( values, list, key, pos )
        {
            let options = JSON.parse ( JSON.stringify ( values ) );
            options["_" + this.list] = {
                key,
                value: list[key],
                even: !( pos % 2),
                pos
            };
            return this.body.render ( options );
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            if ( !values[this.list] ) {
                return "";
            }
            if ( typeof values[this.list] !== "object" ) {
                return "";
            }
            let list = values[this.list];
            let out = "";
            let keys = Array.isArray ( list ) ? list.keys () : Object.keys ( list );
            let pos = 0;
            for (let key of keys) {
                out += this.renderPart ( values, list, key, pos );
                pos++;
            }
            return out;
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
            this.content = typeof content === "string" ? content : "";
        }
        /**
         * @private
         * @param {String} match
         * @return {String}
         */
        replaceMatch ( match ) {
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
         * @private
         * @param {String|Number} unsafe
         * @return {String}
         */
        escape ( unsafe )
        {
            return ( unsafe + "" ).replace ( /[&<"'>]/g, this.replaceMatch );
        }
        /**
         * @public
         * @param {Object} values
         * @return {String}
         */
        render ( values )
        {
            return this.replace ( this.content, values, "" );
        }
        /**
         * @private
         * @param {String} content
         * @param {Object} values
         * @param {String} prefix
         * @return {String}
         */
        replace ( content, values, prefix )
        {
            for (let key in values) {
                if ( typeof values[key] === "object" ) {
                    content = this.replace ( content, values[key], prefix + key + "." );
                } else {
                    content = this.replaceEscaped("{{" + prefix + key + "}}", values[key], content);
                }
            }
            return content;
        }
        /**
         * @param {String} search
         * @param {String} replace
         * @param {String} string
         * @return {String}
         */
        replaceEscaped(search, replace, string)
        {
            return string.replace (
                new RegExp ( search.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&" ), "g" ),
                this.escape ( replace )
            );
        }
    }
    /**
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
            while ( ( pos = code.indexOf ( "{{%" ) ) > -1 ) {
                if ( pos > 0 ) {
                    this.parts.push ( new BodyTag ( code.substring ( 0, pos ) ) );
                }
                code = code.substring ( pos + 3 );
                let pos2 = code.indexOf ( "%}}" );
                let def = ( code.substring ( 0, pos2 ) ).split ( " " );
                let pos3 = this.findEnd ( code, pos2 + 3 );
                this.addToParts ( def[0], def[1], new Template ( code.substring ( pos2 + 3, pos3 ) ) );
                code = code.substring ( pos3 + 9 );
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
            while ( ( pos = code.indexOf ( "{{%", pos2 ) ) > -1 ) {
                pos2 = code.indexOf ( "%}}", pos );
                let def = ( code.substring ( pos + 3, pos2 ) ).split ( " " );
                ins += this.adjustmentForTag(def[0]);
                if ( ins === 0 ) {
                    return pos;
                }
                pos2 += 3;
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
        define([], function() {
          return Template;
        });
    } else {
        window.Template = Template;
    }
}());