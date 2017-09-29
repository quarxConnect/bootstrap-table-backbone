(function ($) {
  // Append our options to bootstrap-table
  $.extend ($.fn.bootstrapTable.defaults, {
    /* Use this collection as data-source */
    backboneCollection : undefined,
    
    /* Force fetch on the used collection */
    backboneCollectionForceFetch : false,
    
    /* Return backbone-models to events */
    backboneReturnModel : false
  });
  
  // Event-Handlers
  var bbOnRequest = function (collection) {
    // Mark the request as active
    this.bbOnRequest = true;
  };
  
  var bbOnError = function (collection) {
    // Remove the active-flag
    this.bbOnRequest = false;
  };
  
  var bbOnChange = function (model) {
    // Push the model to table again
    this.updateByUniqueId (mode.toJSON ());
  };
  
  var bbOnAdd = function (model, collection, options) {
    // Bind to change-events on the model
    model.on ('change', bbOnChange, this);
    
    // Append the model to the table if not on a request
    if (!this.bbOnRequest)
      this.append (model.toJSON ());
  };
  
  var bbOnRemove = function (model, collection, options) {
    // Unbind events
    model.off ('change', bbOnChange, this);
    
    // Remove from the table
    this.removeByUniqueId (model.id);
  };
  
  var bbOnReset = function () {
    // Update the table
    this.initBackbone ();
  };
  
  var bbOnSync = function () {
    // Remove the active-flag
    this.bbOnRequest = false;
    
    // Update the table
    this.initBackbone ();
  };
  
  // Hook into init() of bootstrap-table
  var _btInit = $.fn.bootstrapTable.Constructor.prototype.init;
  
  $.fn.bootstrapTable.Constructor.prototype.init = function () {
    // Bind to collection if there is one
    if (this.options.backboneCollection) {
      // TODO: Force client-pagiantion unless we support backbone.paginator
      this.options.sidePagination = 'client';
      
      // Bind our events
      this.options.backboneCollection.on ('request', bbOnRequest, this);
      this.options.backboneCollection.on ('error',   bbOnError,   this);
      this.options.backboneCollection.on ('add',     bbOnAdd,     this);
      this.options.backboneCollection.on ('remove',  bbOnRemove,  this);
      this.options.backboneCollection.on ('reset',   bbOnReset,   this);
      this.options.backboneCollection.on ('sync',    bbOnSync,    this);
      
      // Copy unique-id-setting
      this.options.uniqueId = this.options.backboneCollection.model.prototype.idAttribute || 'id';
      
      // Set the request-flag to inactive
      this.bbOnRequest = false;
    }
    
    // Inherit to parent
    _btInit.apply (this, arguments);
  }
  
  // Hook into destroy() of bootstrap-table
  var _btDestory = $.fn.bootstrapTable.Constructor.prototype.destroy;
  
  $.fn.bootstrapTable.Constructor.prototype.destroy = function () {
    // Unbind from collection if there is one
    if (this.options.backboneCollection) {
      this.options.backboneCollection.off ('request', bbOnRequest, this);
      this.options.backboneCollection.off ('error',   bbOnError,   this);
      this.options.backboneCollection.off ('add',     bbOnAdd,     this);
      this.options.backboneCollection.off ('remove',  bbOnRemove,  this);
      this.options.backboneCollection.off ('reset',   bbOnReset,   this);
      this.options.backboneCollection.off ('sync',    bbOnSync,    this);
    }
    
    // Inherit to parent
    _btDestroy.apply (this, arguments);
  };
  
  // Hook into initHeader() of bootstrap-table
  var _btInitHeader = $.fn.bootstrapTable.Constructor.prototype.initHeader;
  
  $.fn.bootstrapTable.Constructor.prototype.initHeader = function () {
    // Setup the header first
    var rc = _btInitHeader.apply (this, arguments);
    
    // Check wheter to hook into events
    if (!this.options.backboneReturnModel || !this.options.backboneCollection)
      return rc;
    
    // Remember the table
    var that = this;
    
    // Patch all events
    for (var c in this.header.events)
      for (var e in this.header.events [c])
        this.header.events [c][e] = (function (cb) {
          return function () {
            // Patch the arguments
            arguments [2] = that.options.backboneCollection.get (arguments [2][that.options.backboneCollection.idAttribute || that.options.uniqueId || 'id']);
            
            // Call the initial callback
            cb.apply (this, arguments);
          };
        })(this.header.events [c][e]);
  }
  
  // Hook into initServer() of bootstrap-table
  var _btInitServer = $.fn.bootstrapTable.Constructor.prototype.initServer;
  
  $.fn.bootstrapTable.Constructor.prototype.initServer = function (silent, query, url) {
    // Check wheter we should use backbone here
    if (!this.options.backboneCollection)
      return _btInitServer.apply (this, arguments);
    
    // Show table-loading
    if (!silent)
      this.$tableLoading.show ();
    
    // Check wheter to output data directly
    // HACK: Check length of arguments to check if we were called from refresh()
    if (!this.options.backboneCollectionForceFetch && !(arguments.length == 3))
      return this.initBackbone ();
    
    // Request fetch on our collection
    var table = this;
    
    return this.options.backboneCollection.fetch ().then (function () {
      return table.initBackbone ();
    });
  }
  
  $.fn.bootstrapTable.Constructor.prototype.initBackbone = function () {
    // Check wheter we should use backbone here
    if (!this.options.backboneCollection)
      return;
    
    // Extract/Prepare the data
    var data = this.options.backboneCollection.map (function (model) {
      return model.toJSON ();
    });
    
    // Forward the data
    this.load (data);
    this.trigger ('load-success', data);
    
    // Make sure table-loading is invisible
    this.$tableLoading.hide ();
  };
})(jQuery);