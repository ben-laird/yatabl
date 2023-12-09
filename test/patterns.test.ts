import { assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";

import { y } from "../mod.ts"; // Nice and easy zod-style import

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
