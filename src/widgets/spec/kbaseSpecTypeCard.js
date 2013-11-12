(function( $, undefined ) { 
    $.KBWidget({ 
        name: "KBaseSpecTypeCard", 
        parent: "kbaseWidget", 
        version: "1.0.0",

        options: {
            id: "",
            name: "",
            width: 600
        },

        init: function(options) {
            this._super(options);
            var self = this;
            var container = this.$elem;
            self.$elem.append('<p class="muted loader-table"><img src="assets/img/ajax-loader.gif"> loading...</p>');

            var kbws = new Workspace('http://Romans-MacBook-Pro-4.local:9999/');
            var typeName = this.options.id;
            var typeVer = null;
            if (typeName.indexOf('-') >= 0) {
            	typeVer = typeName.substring(typeName.indexOf('-') + 1);
            	typeName = typeName.substring(0, typeName.indexOf('-'));
            }
        	self.options.name = typeName;
        	var pref = (new Date()).getTime();
        	
        	// build tabs
        	var tabNames = ['Overview', 'Spec-file', 'Functions', 'Using Types', 'Sub-types', 'Versions'];
        	var tabIds = ['overview', 'spec', 'funcs', 'types', 'subs', 'vers'];
        	var tabs = $('<ul id="'+pref+'table-tabs" class="nav nav-tabs"/>');
            tabs.append('<li class="active"><a href="#'+pref+tabIds[0]+'" data-toggle="tab" >'+tabNames[0]+'</a></li>');
        	for (var i=1; i<tabIds.length; i++) {
            	tabs.append('<li><a href="#'+pref+tabIds[i]+'" data-toggle="tab">'+tabNames[i]+'</a></li>');
        	}
        	container.append(tabs);

        	// tab panel
        	var tab_pane = $('<div id="'+pref+'tab-content" class="tab-content">');
        	tab_pane.append('<div class="tab-pane in active" id="'+pref+tabIds[0]+'"/>');
        	for (var i=1; i<tabIds.length; i++) {
            	var tableDiv = $('<div class="tab-pane in" id="'+pref+tabIds[i]+'"> ');
            	tab_pane.append(tableDiv);
        	}
        	container.append(tab_pane);
        
        	// event for showing tabs
        	$('#'+pref+'table-tabs a').click(function (e) {
        		e.preventDefault();
        		$(this).tab('show');
        	});

            var wsAJAX = kbws.get_type_info(this.options.id);
            $.when(wsAJAX).done(function(data){
            	$('.loader-table').remove();

            	////////////////////////////// Overview Tab //////////////////////////////
            	$('#'+pref+'overview').append('<table class="table table-striped table-bordered" \
                        style="margin-left: auto; margin-right: auto;" id="'+pref+'overview-table"/>');
            	typeVer = data.type_def;
            	typeVer = typeVer.substring(typeVer.indexOf('-') + 1);
                var overviewTable = $('#'+pref+'overview-table');
                overviewTable.append('<tr><td>Name</td><td>'+typeName+'</td></tr>');
                overviewTable.append('<tr><td>Version</td><td>'+typeVer+'</td></tr>');
                var moduleName = typeName.substring(0, typeName.indexOf('.'));
                var moduleLinks = [];
                for (var i in data.module_vers) {
                	var moduleVer = data.module_vers[i];
                	var moduleId = moduleName + '-' + moduleVer;
                	moduleLinks[moduleLinks.length] = '<a class="modver-click" data-moduleid="'+moduleId+'">'+moduleVer+'</a>';
                }
                overviewTable.append('<tr><td>Module version(s)</td><td>'+moduleLinks+'</td></tr>');
            	overviewTable.append('<tr><td>Description</td><td><textarea style="width:100%;" cols="2" rows="7" readonly>'+data.description+'</textarea></td></tr>');
                $('.modver-click').unbind('click');
                $('.modver-click').click(function() {
                    var moduleId = $(this).data('moduleid');
                    self.trigger('showSpecElement', 
                    		{
                    			kind: "module", 
                    			id : moduleId,
                    			event: event
                    		});
                });
            	
            	////////////////////////////// Spec-file Tab //////////////////////////////
                var specText = '/*\n' + data.description + "\n*/\n" + data.spec_def;
            	$('#'+pref+'spec').append('<textarea style="width:100%;" cols="2" rows="15" readonly>' + specText + "</textarea>");
                
            	////////////////////////////// Functions Tab //////////////////////////////
            	$('#'+pref+'funcs').append('<table cellpadding="0" cellspacing="0" border="0" id="'+pref+'funcs-table" \
        				class="table table-bordered table-striped" style="width: 100%;"/>');
            	var funcsData = [];
            	for (var i in data.using_func_defs) {
            		var funcId = data.using_func_defs[i];
            		var funcName = funcId.substring(funcId.indexOf('.') + 1, funcId.indexOf('-'));
            		var funcVer = funcId.substring(funcId.indexOf('-') + 1);
            		funcsData[funcsData.length] = {name: '<a class="funcs-click" data-funcid="'+funcId+'">'+funcName+'</a>', ver: funcVer};
            	}
                var funcsSettings = {
                        "fnDrawCallback": funcsEvents,
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 10,
                        "aoColumns": [{sTitle: "Function name", mData: "name"}, {sTitle: "Function version", mData: "ver"}],
                        "aaData": [],
                        "oLanguage": {
                            "sSearch": "Search function:",
                            "sEmptyTable": "No functions use this type."
                        }
                    };
                var funcsTable = $('#'+pref+'funcs-table').dataTable(funcsSettings);
                funcsTable.fnAddData(funcsData);
            	function funcsEvents() {
                    $('.funcs-click').unbind('click');
                    $('.funcs-click').click(function() {
                        var funcId = $(this).data('funcid');
                        self.trigger('showSpecElement', 
                        		{
                        			kind: "function", 
                        			id : funcId,
                        			event: event
                        		});
                    });
                }

            	
            	
            	////////////////////////////// Versions Tab //////////////////////////////
            	$('#'+pref+'vers').append('<table cellpadding="0" cellspacing="0" border="0" id="'+pref+'vers-table" \
                		class="table table-bordered table-striped" style="width: 100%;"/>');
            	var versData = [];
            	for (var i in data.type_vers) {
            		var aTypeId = data.type_vers[i];
                	var aTypeVer = aTypeId.substring(aTypeId.indexOf('-') + 1);
                	var link = null;
                	if (typeVer === aTypeVer) {
                		link = aTypeId;
                	} else {
                		link = '<a class="vers-click" data-typeid="'+aTypeId+'">'+aTypeId+'</a>';
                	}
            		versData[versData.length] = {name: link};
            	}
                var versSettings = {
                        "fnDrawCallback": versEvents,
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 10,
                        "aoColumns": [{sTitle: "Type version", mData: "name"}],
                        "aaData": [],
                        "oLanguage": {
                            "sSearch": "Search version:",
                            "sEmptyTable": "No versions registered."
                        }
                    };
                var versTable = $('#'+pref+'vers-table').dataTable(versSettings);
                versTable.fnAddData(versData);
            	function versEvents() {
                    $('.vers-click').unbind('click');
                    $('.vers-click').click(function() {
                        var aTypeId = $(this).data('typeid');
                        self.trigger('showSpecElement', 
                        		{
                        			kind: "type", 
                        			id : aTypeId,
                        			event: event
                        		});
                    });
                }

            });
            
            return this;
        },
        
        getData: function() {
            return {
                type: "KBaseSpecTypeCard",
                id: this.options.name,
                workspace: '',
                title: "Spec-document Type"
            };
        }
    });
})( jQuery );
