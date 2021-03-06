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

pimcore.registerNS("pimcore.object.tags.link");
pimcore.object.tags.link = Class.create(pimcore.object.tags.abstract, {

    type: "link",
    dirty: false,

    initialize: function (data, fieldConfig) {

        this.data = "";
        this.defaultData = {
            type: "internal",
            path: "",
            parameters: "",
            anchor: "",
            accesskey: "",
            rel: "",
            tabindex: "",
            target: ""
        };

        if (data) {
            this.data = data;
        }
        else {
            this.data = this.defaultData;
        }
        this.fieldConfig = fieldConfig;

    },

    getGridColumnConfig: function(field) {
        var renderer = function(key, value, metaData, record) {
            this.applyPermissionStyle(key, value, metaData, record);

            if(record.data.inheritedFields[key] && record.data.inheritedFields[key].inherited == true) {
                metaData.tdCls += " grid_value_inherited";
            }
            if(value) {
                return value.text;
            }
            return t("empty");

        }.bind(this, field.key);

        return {header: ts(field.label), sortable: true, dataIndex: field.key, renderer: renderer};
    },

    getLayoutEdit: function () {

        var input = {
            name: this.fieldConfig.name
        };

        this.button = new Ext.Button({
            iconCls: "pimcore_icon_link pimcore_icon_overlay_edit",
            style: "margin-left: 5px",
            handler: this.openEditor.bind(this)
        });

        var textValue = "[not set]";
        if (this.data.text) {
            textValue = this.data.text;
        }
        this.displayField = new Ext.form.DisplayField({
            value: textValue
        });

        this.component = new Ext.form.FieldContainer({
            fieldLabel: this.fieldConfig.title,
            layout: 'hbox',
            border: false,
            combineErrors: false,
            items: [this.displayField, this.button],
            componentCls: "object_field"
        });

        return this.component;
    },


    getLayoutShow: function () {

        this.component = this.getLayoutEdit();
        this.button.hide();
        
        return this.component;
    },

    getValue: function () {
        return this.data;
    },

    getName: function () {
        return this.fieldConfig.name;
    },

    openEditor: function () {
        this.window = pimcore.helpers.editmode.openLinkEditPanel(this.data, {
            empty: this.empty.bind(this),
            cancel: this.cancel.bind(this),
            save: this.save.bind(this)
        });
    },

    openSearchEditor: function () {
        pimcore.helpers.itemselector(false, this.addDataFromSelector.bind(this), {
            type: ["asset","document"]
        });
    },

    save: function () {
        var values = this.window.getComponent("form").getForm().getFieldValues();
        if(Ext.encode(values) != Ext.encode(this.data)) {
            this.dirty = true; 
        }
        this.data = values;

        var textValue = "[not set]"; 
        if (this.data.text) {
            textValue = this.data.text;
        }
        this.displayField.setValue(textValue);

        // close window
        this.window.close();
    },

    empty: function () {

        // close window
        this.window.close();

        this.data = this.defaultData;
        this.dirty = true; 

        // set text
        this.displayField.setValue("[not set]");
    },

    cancel: function () {
        this.window.close();
    },

    isDirty: function() {
        if(!this.isRendered()) {
            return false;
        }

        return this.dirty;
    }
});