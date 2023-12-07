/**
 * the tag symbol used by YATABL. Do not use!
 */
const _tag = Symbol();

/**
 * Class to manage YATABL's tag logic. Do not use!
 */
class Tagged<
  T extends DataStructure,
  const N extends string | symbol = symbol
> {
  readonly [_tag]: { thing: T; name?: N };

  private constructor(params: { thing: T; name?: N }) {
    this[_tag] = params;
  }

  static $tag<T extends DataStructure, const N extends string | symbol>(
    thing: T,
    name?: N
  ): Tag<T, N> {
    return Object.assign(thing, new Tagged({ thing, name }));
  }
}

export type DataStructure =
  | Record<string | number | symbol, unknown>
  | unknown[];

export type Untag<T extends Tag<DataStructure, string | symbol>> =
  T extends Tag<infer U, string | symbol> ? U : never;

export type Tag<
  T extends DataStructure,
  N extends string | symbol = symbol
> = T & Tagged<T, N>;

export type Yatable<T extends DataStructure> = (thing: unknown) => T;

//#region Tagging

/**
 * uniquely tag something using a creator function and a symbol
 * @param yatable function used to test the input. Great place to put validation logic!
 */
export function tag<T extends DataStructure>(
  yatable?: Yatable<T>
): (thing: T) => Tag<T>;
/**
 * tag something using a creator function and a name
 * @param yatable function used to test the input. Great place to put validation logic!
 * @param name string or symbol to use in tagging. Use symbol for extra secrecy/uniqueness, string for testing whether an object has passed the creator function's validation, nothing for simplicity or a middle ground between nominal and structural typing
 */
export function tag<T extends DataStructure, const N extends string | symbol>(
  yatable: Yatable<T>,
  name?: N
): (thing: T) => Tag<T, N>;
/**
 * tag something by directly passing in the thing to be tagged
 * @param thing data structure to tag
 * @param name string or symbol to use in tagging. Use symbol for extra secrecy/uniqueness, string for testing whether an object has passed the creator function's validation, nothing for simplicity or a middle ground between nominal and structural typing
 */
export function tag<T extends DataStructure, const N extends string | symbol>(
  thing: T,
  name?: N
): Tag<T, N>;
export function tag<T extends DataStructure, const N extends string | symbol>(
  yatable?: T | Yatable<T>,
  name?: N
) {
  switch (typeof yatable) {
    case "object": {
      return Tagged.$tag(yatable, name);
    }
    case "function": {
      return (struct: T) => Tagged.$tag(yatable(struct), name);
    }
    case "undefined": {
      return (struct: T) => Tagged.$tag(struct, Symbol());
    }
  }
}

/**
 * Escape hatch used to remove tags and revert back to the structural type system
 * @param tagged thing to untag
 * @returns untagged thing
 */
export function untag<T extends DataStructure>(tagged: Tag<T>) {
  return tagged[_tag].thing;
}

/**
 * Type guard to aid in validating a thing has passed validation requirements
 * @param thing thing to test
 * @returns boolean indicating whether thing is tagged or not
 */
export function isTagged<T extends DataStructure>(thing: T): thing is Tag<T> {
  return _tag in thing;
}

/**
 * Type guard to aid in validating a thing has passed a specific set of validation requirements
 * @param thing thing to test
 * @param name identifier to test whether thing has passed a specific set of validation requirements
 * @returns boolean indicating whether thing is tagged by a tagger with this name
 */
export function isNameTagged<T extends DataStructure, const N extends string>(
  thing: T,
  name: N
): thing is Tag<T, N> {
  return (
    isTagged(thing) &&
    typeof thing[_tag].name === "string" &&
    thing[_tag].name === name
  );
}

/**
 * typed validation function for when you don't need to do any validation logic
 * @returns identity validation function that simply casts anything passed in to type T
 */
export function caster<T extends DataStructure>() {
  return (thing: unknown) => thing as T;
}

//#endregion
