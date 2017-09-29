# Backbone-Connector for Bootstrap-Table
Easily connect Backbone-Collections to Bootstrap-Table.

## Usage
~~~ {.html}
<script type="text/javascript" src="bootstrap-table-backbone.js"></script>

<script type="text/javascript">

  var collection = new Backbone.Collection ([ ], { });
  
  $('#table').bootstrapTable ({
    backboneCollection : collection,
    backboneCollectionForceFetch : false,
    backboneReturnModel : true
  });

</script>
~~~

This library adds the options `backboneCollection`,
`backboneCollectionForceFetch` and `backboneReturnModel` to Bootstrap-Table.

`backboneCollection` takes a collection from backbone as data-source just
like `data` or `url` would do for local or remote data-sources. It is no
longer neccessary to bridge both components manually or run two requests on
the remote data-source. You may also use different data-sources for Backbone
(like local-storage) without the need to patch bootstrap-table.

If `backboneCollectionForceFetch` is set to `true` the library will call
`fetch()` on the collection whenever bootstrap-table needs to have models
available.

`backboneReturnModel` will add the model matching the row on the table that
triggered an event.

## Copyright & License
Copyright (C) 2017 Bernd Holzmüller

Licensed under the MIT License. This is free software: you are free to
change and redistribute it. There is NO WARRANTY, to the extent
permitted by law.
