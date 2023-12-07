# Yet Another Tagging and Branding Library

A ridiculously simple tagging and branding library that focuses on doing one thing and doing it well.

## Features

- Small, Performant, Flexible
  - 0 dependencies
  - Browser/Node/Bun/Deno/Edge friendly
  - Built with core JS/TS language constructs: if your runtime supports classes and `Object.assign()`, it supports `yatabl`
  - Incredibly small footprint: entire source code (before bundling, including doc comments + types) is about 130 lines across 2 files
  - Tree-shakeable: don't pay for what you don't use (not a lot to pay for with this lib anyways)
- Great DX
  - Type & runtime safe: made with love in TypeScript, doesn't lose any safety guarantees when compiled to JavaScript
  - Easy interoperability: `yatabl` plays nice with pretty much any schema validation library, like Zod, Yup, runtypes, and more
  - Easy adoptability: `yatabl` only adds metadata to objects and doesn't wrap them, allowing devs to just drop it in and perform easy validation checks wherever
  - Validate once, enforce everywhere: save time and resources by
    - asserting in your function types that something must pass validation before being passed in, or
    - validating something once in your code and checking if it passed everywhere else, or
    - enforcing assumptions or type/validation contracts you make in your code
  - Docs included: JSDoc comments included so you never have to look at this page again :smile:

## Installation

Using a package manager like `npm`:

```sh
npm install yatabl
```

```ts
import { y } from "yatabl";
```

Using Deno:

```ts
import { y } from "https://deno.land/x/yatabl/mod.ts";
```

## Usage

Here are some examples taken right from the test suite:

```ts
import { caster, tag } from "https://deno.land/x/yatabl/mod.ts";

Deno.test(async function Examples(t) {
  await t.step({
    name: "Direct creation of tag",
    fn() {
      const Rex = { legion: 501, rank: "Captain" };

      const _taggedRex = tag(Rex, "Captain Rex");
    },
  });

  await t.step({
    name: "Creator function",
    fn() {
      const Cody = { battalion: 212, rank: "Commander" };

      type T_Cody = typeof Cody;

      // Use the included `caster()` function with a type to create a tagger function
      // that performs no runtime validation and only constrains the input type
      const CodyTagger = tag(caster<T_Cody>(), "Commander Cody");

      const _taggedCody = CodyTagger(Cody);
    },
  });

  await t.step({
    name: "Creator function with guard",
    fn() {
      type Jedi = {
        affiliation: "Jedi";
        rank: "General";
        name: string;
      };

      const JediTagger = tag((x) => {
        // Put your validation logic right here! Use basically any schema validation library you want!

        if (!(x && typeof x === "object")) {
          throw new Error("validation failed!");
        }

        if (!("affiliation" in x && x.affiliation === "Jedi")) {
          throw new Error("should be affiliated with the Jedi!");
        }

        if (!("rank" in x && x.rank === "General")) {
          throw new Error("should be a Jedi General!");
        }

        if (!("name" in x && typeof x.name === "string")) {
          throw new Error("Jedi should have a name!");
        }

        // the only reason the `as` cast is needed here is because the validation logic is pretty basic.
        // Even with `as` casts, the input will be guaranteed to match the type,
        // so the `as` cast here isn't dangerous to use!
        return x as Jedi;
      }, "Jedi General");

      const _Anakin = JediTagger({
        affiliation: "Jedi",
        rank: "General",
        name: "Anakin Skywalker",
      });

      const _ObiWan = JediTagger({
        affiliation: "Jedi",
        rank: "General",
        name: "Obi-Wan Kenobi",
      });
    },
  });
});
```

## The Secret Sauce: Yatables

The secret sauce of `yatabl` is a function type called a `Yatable`. It represents any validation function.

```ts
export type Yatable<T extends DataStructure> = (thing: unknown) => T;
```

It's generic enough to allow for working with any schema validation library (or type narrowing system in general), yet it allows for us to constrain any values we pass into our tagger function to type `T`. People could even write simple functions to convert schema validation constructs into `Yatable`s. In the future, there will be some official utility functions to convert things like type guards, type assertions, and Zod schemas into `Yatable`s.

## To-Dos & Upcoming Features

- [ ] `Yatable` Converters
  - [ ] Zod
  - [ ] Yup
  - [ ] Type guard
  - [ ] Type assertion
- [ ] Metadata
  - [ ] Ctx
  - [ ] Validator auth (to determine which validator did what)
- [ ] Error handling (maybe need a new library for that)
- [ ] Event emission (for error logging or pub/sub programming)

## Support

If you like this library, thanks so much! I'm glad to make something people like using. If you _really_ like it and want to support me, star this library on [GitHub](https://github.com/ben-laird/yatabl) or [buy me a coffee](https://www.buymeacoffee.com/benlaird). Any support/encouragement is greatly appreciated!
