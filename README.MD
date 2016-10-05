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