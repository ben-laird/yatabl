import { yatable, tag } from "../mod.ts";

Deno.test(async function Examples(t) {
  await t.step({
    name: "Quickstart",
    fn() {
      const Clone = tag(
        "Clone Trooper",
        yatable<{
          rank: string;
          id: number;
          name?: string;
        }>()
      );

      const _fives = Clone({
        id: 5555,
        rank: "Trooper",
        name: "Fives",
      });
    },
  });

  await t.step({
    name: "Direct creation of tag",
    fn() {
      const Rex = { legion: 501, rank: "Captain" };

      const _taggedRex = tag("Captain Rex", Rex);
    },
  });

  await t.step({
    name: "Creator function",
    fn() {
      const Cody = { battalion: 212, rank: "Commander" };

      const CodyTagger = tag("Commander Cody", yatable<typeof Cody>());

      const _taggedCody = CodyTagger(Cody);
    },
  });

  await t.step({
    name: "Creator function with guard",
    fn() {
      type JediInfo = {
        affiliation: "Jedi";
        rank: "General";
        name: string;
      };

      const Jedi = tag("Jedi General", (x) => {
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

        return x as JediInfo;
      });

      const _Anakin = Jedi({
        affiliation: "Jedi",
        rank: "General",
        name: "Anakin Skywalker",
      });

      const _ObiWan = Jedi({
        affiliation: "Jedi",
        rank: "General",
        name: "Obi-Wan Kenobi",
      });
    },
  });
});
