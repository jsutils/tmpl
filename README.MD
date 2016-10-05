#jsutils.tmpl

##_if
```html
<_if data.value==34>
    It is 34
<_elseif data.value==40 />
    it is 45
<_else/>
    I dont know
</_if>
```

##_for

```html

<_for var i=0;i<10;i++>
    <span>for{{i}}</span>
</_for>

```

##_forEach

```html

<_forEach var key value in data>
    <span>{{key}}=={{value}}</span>
</_forEach>

```

##_tags

```html
<_tags jq-label jq-switch/>

```
custom tags to be used in current template, can be configured by method `jsutils.tmpl.tags`

```javascript

jsutils.tmpl.tags(function(tagName){
    if(tagName.indexOf("jq-")===0){
        module(tag.replace("jq-","jqtags."));
        return true;
    } else {
        return false;
    }
});

```
You can create your own directives
```javascript

jsutils.tmpl.tags(function(tagName){
    if(tagName.indexOf("jq-")===0){
        module(tag.replace("jq-","jqtags."));
        return true;
    } else {
        return false;
    }
});

```
