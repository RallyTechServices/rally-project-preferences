Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'settings_box', defaults: {padding: 10, margin: 10 }},
        {xtype:'container',itemId:'buttons_box', defaults: {padding:10,margin:10}},

        {xtype:'tsinfolink'}
    ],
    launch: function() {
        this.project = this.getContext().getProject();
        this.logger.log("Project:", this.project.Name);
        //TODO: make sure this user has permission
        //TODO: check settings
        this._settingFields = [
            { dataIndex:'Cost', type: 'rallynumberfield' },
            { dataIndex:'PIL', type: 'combo_box', values: ['I2M', 'M2O', 'O2C'] },
            { dataIndex:'Stage', type: 'combo_box', values: ['Foreseen', 'Planned', 'Active'] }
            
        ],
		current_user = 'pietje',
		
		this._InspectUser();
		this.logger.log("after user: ");

       
        this._getCurrentSettings();
        
//        this.settings = {
//            foo: "John was here",
//            bar: "So were Eloi and Adrie"
//        };
//        
//        this._saveSettings();
    },
	
	_InspectUser: function(){
	var me = this;
	    current_user = this.getContext().getUser();
		current_user_email = current_user.UserName;
			me.logger.log("this is me: ", current_user);
			me.logger.log("this is me: ", current_user_email);
			current_project = this.getContext().getProject().ObjectID;
			this._getProjectDetails(current_project);
			me.logger.log("this is project: ", current_project);
			me.logger.log("this is owner: ", "test");
			me.logger.log("this is owner: ", this.project_store);
		
	},

	_getProjectDetails: function(current_project) {
	this.logger.log("project name: ", current_project);
		this.project_store = Ext.create('Rally.data.wsapi.Store',{
			model: 'Project',
			filters: [{
						property: "ObjectID",
						operator: "=",
						value: current_project
					}],
			scope: this,
			autoLoad: true,
			listeners: {
				scope: this,
				load: function(store, data, success) {
					this.logger.log("been here",data[0].get('Owner').UserName);
					this.logger.log("result: ", this.project.Name);
					/* need to do modification check here (for async) */
				}
			},
			fetch: ['Name', 'Owner','UserName']
		});
		this.logger.log("been here too");
	},
	
    _getCurrentSettings: function() {
        Rally.data.PreferenceManager.load({
            project: this.getContext().getProject(),
            filterByName: 'philips.project.settings',
            scope: this,
            success: function(prefs) {
                if ( prefs && prefs['philips.project.settings'] ) {
                    this.settings = Ext.JSON.decode(prefs['philips.project.settings']);
                }
                this.logger.log("pref retrieved: ", this.settings );
                this._displaySettings();
                this._addButtons();
            }
        });
    },
	
	_getStore4field: function(field) {
	var data_array = [];
	
		Ext.Array.each(
			field.values, function(value){
				data_array.push({value: value})
			});
			
	         return Ext.create('Ext.data.Store', {
            fields: ['value'],
            data : data_array
        });
	},
	
    _addButtons: function() {
        this.down('#buttons_box').add({
            itemId:'save_button',
            xtype:'rallybutton',
            text:'Save Settings',
            listeners: {
                scope: this,
                click: function(button) {
                    button.setDisabled(true);
                    this._saveSettings();
                }
            }
        });
    },
    _displaySettings: function() {
        var me = this;
        // Put up greeting notice
        this.down('#settings_box').add({
            xtype:'container',
            html: 'To set "special" properties for the project called ' +
                this.getContext().getProject().Name + 
                ', change the values below'
        });
        // cycle through the fields and display them for changing
        Ext.Array.each(this._settingFields, function(field) {
            var type = field.type;
            var label = field.dataIndex;
            var value = me.settings[label];
            if ( type == 'rallynumberfield' ) {
                me.down('#settings_box').add({
                    xtype: type,
                    value: value,
                    fieldLabel: label,
                    listeners: {
                        change: function( numberfield, new_value ) {
                            me.settings[label] = new_value;
                        }
                    }
                });
            }
             if ( type == 'combo_box' ) {
                me.down('#settings_box').add({
                   xtype: 'combobox',
                    fieldLabel: label,
                    value: value,
                    store: me._getStore4field(field),
                    queryMode: 'local',
                    displayField: 'value',
                    valueField: 'value',
                    listeners:{
                        scope: this,
                        'select': function(cb){
                         me.settings[label] = cb.getValue();
                        }
                    }
                });

             }
        });
    },
    _saveSettings: function() {
        var me = this;
        // save whatever all the current settings are
        Rally.data.PreferenceManager.update({
            project: this.getContext().getProject(),
            settings: {
                'philips.project.settings': Ext.JSON.encode(this.settings)
            },
            success: function(updatedRecords, notUpdatedRecords) {
                me.down('#save_button').setDisabled(false);
            },
            failure: function() {
                alert('there was a problem');
            }
        });
    }
});
