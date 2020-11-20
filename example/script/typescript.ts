/**
 * class syntax
 */
!(function () {
    class Parent {
        name: string;

        constructor(name: string) {
            this.name = name;
        }

        method() {
            console.log(this.name + " is parent");
        }
    }

    class Child extends Parent {
        name: string;

        constructor(name: string) {
            super("[Child] " + name);
        }

        method() {
            console.log(this.name + " is child");
        }
    }

    const parent = new Parent("foo");
    const child = new Child("bar");

    parent.method();
    child.method();
})();

/**
 * arrow function, default argument
 */
!(function () {
    const f = (v: string): string => v;
    console.log(f("str"));
})();

/**
 * object literal, template literal
 */
!(function () {
    const c = "c";
    const d = `${c} and d`;
    const hoge = { [c]: "A", d };
    console.log(hoge);
})();

/**
 * function
 */
!(function () {
    function f(x: number, y: boolean): string {
        return "fuga";
    }
    console.log(f(1, false));
})();

/**
 * type
 */
!(function () {
    type Book = {
        author: string;
        pages: number;
        used: boolean;
    };
    function showBook(book: Book) {
        console.log(`author: ${book.author}`);
        console.log(`pages: ${book.pages}`);
        console.log(`used: ${book.used}`);
    }
    const book: Book = { author: "me", pages: 123, used: false };
    showBook(book);
})();

/**
 * interface
 */
!(function () {
    interface HasName {
        getName(): string;
    }
    class Person implements HasName {
        constructor (name) {
            this.name = name
        }

        getName (): string {
            return this.name;
        }
    }
    const person: Person = new Person('mike');
    console.log(person.getName())
})();

// errored. for source map confirmation
undefinedFunction(1, 2, 3);
