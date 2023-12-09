# Yet Another Tagging and Branding Library

Yatabl (pronounced "YEA-tuh-bull") is a dead-simple tagging and branding library that focuses on doing one thing and doing it well.

## Features

- Small, Performant, Flexible
  - 0 dependencies
  - Browser/Node/Bun/Deno/Edge friendly
  - Built with core JS/TS language constructs: if your runtime supports classes and `Object.assign()`, it supports `yatabl`
  - Incredibly small footprint: entire source code (before bundling, including doc comments + types) is about 240 lines across 3 files (an average of about 80 lines per file)
  - Tree-shakeable: don't pay for what you don't use (not a lot to pay for with this lib anyways)
- Great DX
  - Type & runtime safe: made with love in TypeScript, doesn't lose any safety guarantees when compiled to JavaScript
  - Aggressive inferences: stay highly type-safe while barely having to write your own types
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

## Usage and Patterns

Here's a quick guide by example on the ideal patterns to use:

```ts
import { assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";

import { y } from "https://deno.land/x/yatabl/mod.ts"; // Convenient zod-style import

Deno.test(async function Patterns(t) {
  await t.step({
    name: "Quickstart",
    fn() {
      // Step 1: define a tag function
      const Clone = y.tag(
        "Clone Trooper",
        y.yatable<{
          rank: string;
          id: number;
          name?: string;
        }>()
      );

      // Step 2: use tag function wherever you want!
      const _fives = Clone({
        id: 5555,
        rank: "Trooper",
        name: "Fives",
      });
    },
  });

  await t.step({
    name: "Tag function with validation",
    fn() {
      // interfaces are unsupported because of a TypeScript language issue :(
      type JediInfo = {
        affiliation: "Jedi";
        rank: "General";
        name: string;
      };

      // You can include validation logic in your tag functions too!
      const Jedi = y.tag("Jedi General", (x) => {
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

        // `as` casting here doesn't compromise type safety because x has passed validation
        return x as JediInfo;
      });

      // input argument infers from return type...
      const _ObiWan = Jedi({
        affiliation: "Jedi",
        rank: "General",
        name: "Obi-Wan Kenobi",
      });

      // So this throws an error in TypeScript and at runtime!
      assertThrows(() => {
        const _Anakin = Jedi({
          //@ts-expect-error: intentionally incorrect
          affiliation: "Sith",
          rank: "General",
          name: "Anakin Skywalker",
        });
      });
    },
  });

  await t.step({
    name: "Tag function inside validation",
    fn() {
      // interfaces are unsupported because of a TypeScript language issue :(
      type JediInfo = {
        affiliation: "Jedi";
        rank: "General";
        name: string;
      };

      type JediValidation = {
        affiliation: string;
        rank: string;
        name: string;
      };

      // This is a much safer way to validate data, as it won't throw any errors
      // and will instead return `undefined` on validation failure
      function validateJedi(jedi: JediValidation) {
        if (jedi.affiliation === "Jedi" && jedi.rank === "General") {
          return y.tag("Jedi General", jedi as JediInfo);
        }
      }

      const _ObiWan = validateJedi({
        affiliation: "Jedi",
        rank: "General",
        name: "Obi-Wan Kenobi",
      });

      const _Anakin = validateJedi({
        affiliation: "Sith",
        rank: "General",
        name: "Anakin Skywalker",
      });
    },
  });

  await t.step({
    name: "Tag function with transformation, and checking if validation passed",
    fn() {
      interface Clone {
        id: number;
        name?: string;
      }

      type RankedClone = {
        id: number;
        name?: string;
        rank: string;
      };

      function salute(clone: RankedClone) {
        // We test to see if the clone has passed Arc Trooper validation
        if (
          y.isTagged("Arc Trooper", clone) ||
          y.isTagged("Commander", clone)
        ) {
          // We now know this clone is an Arc Trooper or a Commander!
          // Notice you can still use `clone` as its original type.
          // Yatabl only adds metadata and never alters your objects otherwise
          const message = `Attention! ${clone.rank} ${
            clone.name ?? clone.id
          } is on deck!`;

          console.log(message);
        } else {
          console.log(`${clone.name ?? clone.id} is not recognized!`);
        }
      }

      /**
       * Trooper tag functions
       */
      const Trooper = {
        // You can even include transformation logic and combine it with validation logic!
        Arc: y.tag("Arc Trooper", ({ name, id }: Clone): RankedClone => {
          return { rank: "Arc Trooper", name, id };
        }),
        Commander: y.tag("Commander", ({ name, id }: Clone): RankedClone => {
          return { rank: "Commander", name, id };
        }),
        Trooper: y.tag(({ name, id }: Clone): RankedClone => {
          return { rank: "Trooper", name, id };
        }),
      };

      const Jesse = Trooper.Arc({ id: 5597, name: "Jesse" });

      const Cody = Trooper.Commander({ id: 2224, name: "Cody" });

      const Crosshair = Trooper.Trooper({ id: 9904, name: "Crosshair" });

      salute(Jesse); // prints "Attention! Arc Trooper Jesse is on deck!"

      salute(Cody); // prints "Attention! Commander Cody is on deck!"

      salute(Crosshair); // prints "Crosshair is not recognized!"
    },
  });
});
```

## The Secret Sauce: Yatables

The secret sauce of `yatabl` is a function type called a `Yatable`. It represents any processing (validation and/or same-type transformation) function.

```ts
export type Yatable<T extends DataStructure, U = T> = (thing: U) => T;
```

It's generic enough to allow for working with any schema validation library (or type narrowing system in general), yet it allows for us to constrain any values we pass into our tagging functions to type `T` or to type `U` if transformation is needed. We could even write simple functions to convert schema validation constructs into `Yatable`s, and in the future, there will be some official utility functions to convert things like type guards, type assertions, and Zod schemas into `Yatable`s.

## Roadmap

- [ ] `Yatable` Converters
  - [ ] Zod
  - [ ] Yup
  - [ ] Type guard
  - [ ] Type assertion
- [ ] Metadata
  - [ ] Ctx
  - [ ] Validator auth (to determine which validator did what)
- [ ] Error handling (maybe need a new library for that)
- [ ] Event emission (for error logging or pub/sub programming, may also need a new library)
- [x] Full transformation functions (a la `new`-able objects)

## Support

If you like this library, thanks so much! I'm glad to make something people like using. If you _really_ like it and want to support me, star this library on [GitHub](https://github.com/ben-laird/yatabl) or [buy me a coffee](https://www.buymeacoffee.com/benlaird). Any support/encouragement is greatly appreciated!
