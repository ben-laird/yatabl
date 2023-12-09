import { caster, tag } from "https://deno.land/x/yatabl@v0.1.0/src/mod.ts";

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

      const CodyTagger = tag(caster<typeof Cody>(), "Commander Cody");

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

  await t.step({
    name: "Quickstart",
    fn() {
      type CloneTrooper = {
        rank: string;
        id: number;
        name?: string;
      };

      const Clone = tag(caster<CloneTrooper>(), "Clone Trooper");

      const _fives = Clone({
        id: 5555,
        rank: "Trooper",
        name: "Fives",
      });
    },
  });
});
