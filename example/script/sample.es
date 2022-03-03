/**
 * class syntax
 */
!function () {
    class Parent {
        constructor(name) {
            this.name = name;
        }

        method() {
            console.log(this.name + ' is parent');
        }
    }

    class Child extends Parent {
        constructor(name) {
            super('[Child] ' + name);
        }

        method() {
            console.log(this.name + ' is child');
        }
    }

    const parent = new Parent('hoge');
    const child = new Child('fuga');

    parent.method();
    child.method();
}();

/**
 * arrow function, default argument
 */
!function () {
    const f = (v = 'arrow default') => v;
    console.log(f());
    console.log(f('hoge'));
}();

/**
 * object literal, template literal
 */
!function () {
    function tag() {
        return 'TAG';
    }
    const a = 'a';
    const b = `${a} and b`;
    const hoge = {[a]: 'A', b, c: tag`${a}`};
    console.log(hoge);
}();

/**
 * for of, destructuring assignment
 */
!function () {
    const entries = [
        ['key1', 'value1'],
        ['key2', 'value2'],
    ];
    for (const [key, value] of entries) {
        console.log(key, value);
    }
}();

/**
 * generator, yield
 */
!function () {
    function* generator(...args) {
        for (const arg of args) {
            yield arg * 2;
        }
    }

    for (const arg2 of generator(1, 2, 3)) {
        console.log(arg2);
    }
}();

/**
 * async, await
 */
!async function () {
    const response = await fetch('./');
    const text = await response.text();
    console.log(text.length);
}();

// errored. for source map confirmation
undefinedFunction(1, 2, 3);
