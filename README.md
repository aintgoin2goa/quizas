# quizas

A sort-of [Moand](https://en.wikipedia.org/wiki/Monad_(functional_programming)) type thing for reading objects.  Bascially a way to avoid doing a ton if `if` statements to check the data is the way you expect it to be before using it.  Quizas will endevaour to do these checks for you and return something without erroring.  

## Installation

  npm i --save quizas
  
## Usage

```
var result = quizas(obj, 'path.to.value')
```

## Methods

### `quizas(obj:Object, path:string):Quizas` 
The factory function to call. The first param is the object to want to read from (usually a bunch of JSON data you just got from a http request or something), the 2nd is the path you want to drill down to.  So given this object:
```
var obj = {
  foo: {
    bar: [
      {
        baz: 1
      }
    ]
}
```

Calling `quizas(obj, 'foo.bar.0.baz').value`.  `value` will be `1`;  

The Quizas object has the folling properties and methods:

#### `.hasValue`
Boolean - true is the path given to the function resulted in a value, false if not

#### `.value`
The value if one was found, `null` if not

#### `.extract(...props)`
If `value` is an object this will extract the following properties from it and return a new object.  It will not alter the source object. If `value` is null, this will return an empty object.  For example:
```
var obj = {
  foo: {
    bar: {
      prop1: '1',
      prop2: '2',
      prop3: '3
    }
}

var result = quizas(obj, 'foo.bar').extract('prop1', 'prop3');
// result === {prop1:'1',prop:'2'}
```

you can also rename properties as you extract:
```
var obj = {
  foo: {
    bar: {
      prop1: '1',
      prop2: '2',
      prop3: '3
    }
}

var result = quizas(obj, 'foo.bar').extract(['prop1', 'one'], ['prop3', 'two']);
// result === {one:'1',two:'2'}
```

#### `.pluck(...props)`
Similar to `extract()` except this is for arrays of objects.  When `value` is an array this will loop through the array grabbing the given properties from each element.  Example:
```
var obj = {
    foo: {
        bar: [
            {prop1:'1', prop2:'2', prop3:'3'},
            {prop1:'1', prop2:'2', prop3:'3'},
            {prop1:'1', prop2:'2', prop3:'3'}
        ]
    }
}
var result = quizas(obj, 'foo.bar').pluck(['prop1', 'one'], 'prop3')
// result === [{'one':'1', 'prop3:'3'}, {'one':'1', 'prop3:'3'}, {'one':'1', 'prop3:'3'}];


