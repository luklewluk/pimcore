/**
 * Pimcore
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2009-2016 pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     GNU General Public License version 3 (GPLv3)
 */

pimcore.registerNS("pimcore.object.tags.select");
pimcore.object.tags.select = Class.create(pimcore.object.tags.abstract, {

    type: "select",

    initialize: function (data, fieldConfig) {
        this.defaultValue = null;
        if ((typeof data === "undefined" || data === null) && fieldConfig.defaultValue) {
            data = fieldConfig.defaultValue;
            this.defaultValue = data;
        }


        this.data = data;
        this.fieldConfig = fieldConfig;

    },

    getGridColumnConfig:function (field) {
        var renderer = function (key, value, metaData, record) {
            this.applyPermissionStyle(key, value, metaData, record);

            if (record.data.inheritedFields[key] && record.data.inheritedFields[key].inherited == true) {
                try {
                    metaData.tdCls += " grid_value_inherited";
                } catch (e) {
                    console.log(e);
                }
            }

            for(var i=0; i<field.layout.options.length; i++) {
                if(field.layout.options[i]["value"] == value) {
                    return field.layout.options[i]["key"];
                }
            }

            return value;

        }.bind(this, field.key);

        return {header:ts(field.label), sortable:true, dataIndex:field.key, renderer:renderer,
            editor:this.getGridColumnEditor(field)};
    },

    getGridColumnEditor: function(field) {
        if(field.layout.noteditable) {
            return null;
        }

        var store = new Ext.data.JsonStore({
            autoDestroy: true,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    rootProperty: 'options'

                }
            },
            fields: ['key',"value"],
            data: field.layout
        });

        var editorConfig = {};

        if (field.config) {
            if (field.config.width) {
                if (intval(field.config.width) > 10) {
                    editorConfig.width = field.config.width;
                }
            }
        }

        editorConfig = Object.extend(editorConfig, {
            store: store,
            triggerAction: "all",
            editable: false,
            mode: "local",
            valueField: 'value',
            displayField: 'key'
        });

        return new Ext.form.ComboBox(editorConfig);
    },

    getGridColumnFilter: function(field) {
        var store = Ext.create('Ext.data.JsonStore', {
            fields: ['key',"value"],
            data: field.layout.options
        });

        return {
            type: 'list',
            dataIndex: field.key,
            labelField: "value",
            idField: "key",
            options: store
        };
    },

    getLayoutEdit: function () {
        // generate store
        var store = [];
        var validValues = [];

        if(!this.fieldConfig.mandatory) {
            store.push(["","(" + t("empty") + ")"]);
        }

        var restrictTo = null;
        if (this.fieldConfig.restrictTo && this.fieldConfig.restrictTo.length > 0) {
            restrictTo = this.fieldConfig.restrictTo.split(",");
        }

        if (this.fieldConfig.options) {
            for (var i = 0; i < this.fieldConfig.options.length; i++) {
                var value = this.fieldConfig.options[i].value;
                if (restrictTo) {
                    if (!in_array(value, restrictTo)) {
                        continue;
                    }
                }
                store.push([value, ts(this.fieldConfig.options[i].key)]);
                validValues.push(value);
            }
        }

        var options = {
            name: this.fieldConfig.name,
            triggerAction: "all",
            editable: true,
            typeAhead: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: this.fieldConfig.title,
            store: store,
            componentCls: "object_field",
            width: 250,
            labelWidth: 100
        };

        if (this.fieldConfig.labelWidth) {
            options.labelWidth = this.fieldConfig.labelWidth;
        }

        if (this.fieldConfig.width) {
            options.width = this.fieldConfig.width;
        }

        options.width += options.labelWidth;

        if (typeof this.data == "string" || typeof this.data == "number") {
            if (in_array(this.data, validValues)) {
                options.value = this.data;
            } else {
                options.value = "";
            }
        } else {
            options.value = "";
        }

        this.component = new Ext.form.ComboBox(options);

        return this.component;
    },


    getLayoutShow: function () {

        this.component = this.getLayoutEdit();
        this.component.disable();

        return this.component;
    },

    getValue:function () {
        if (this.isRendered()) {
            return this.component.getValue();
        } else if (this.defaultValue) {
            return this.defaultValue;
        }
        return this.data;
    },


    getName: function () {
        return this.fieldConfig.name;
    },

    isDirty:function () {
        var dirty = false;

        if(this.defaultValue) {
            return true;
        }

        if (this.component && typeof this.component.isDirty == "function") {
            if (this.component.rendered) {
                dirty = this.component.isDirty();

                // once a field is dirty it should be always dirty (not an ExtJS behavior)
                if (this.component["__pimcore_dirty"]) {
                    dirty = true;
                }
                if (dirty) {
                    this.component["__pimcore_dirty"] = true;
                }

                return dirty;
            }
        }

        return false;
    }

});