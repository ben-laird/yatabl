// deno-lint-ignore-file no-namespace

/**
 * # Yatabl
 */
export * as y from "./lib.ts";

//#region Internals

/**
 * Internal tag symbol used by YATABL. Do not use!
 */
const yatabl_tag = Symbol("yatabl/tag");

/**
 * Internal class to manage YATABL's tag logic. Do not use!
 */
class Tagged<T extends DataStructure, const N extends Tag.Name = undefined> {
  readonly [yatabl_tag]: { thing: T; name: N };

  private constructor(params: { thing: T; name: N }) {
    this[yatabl_tag] = params;
  }

  static $tag<T extends DataStructure>(thing: T): Tag.Anon<T>;
  static $tag<T extends DataStructure, const N extends Tag.Name>(
    name: N,
    thing: T
  ): Tag<N, T>;

  static $tag<T extends DataStructure, const N extends Tag.Name>(
    ...params: $P.T<N, T>
  ) {
    if ($guard.tag(params)) {
      const [thing] = params;

      return Object.assign(thing, new Tagged({ thing, name: undefined }));
    } else {
      const [name, thing] = params;

      return Object.assign(thing, new Tagged({ thing, name }));
    }
  }
}

namespace $guard {
  export function tag<T extends DataStructure, const N extends Tag.Name>(
    params: $P.T<N, T>
  ): params is [T] {
    return typeof params[0] === "object";
  }

  export function yatable<
    T extends DataStructure,
    const N extends Tag.Name,
    X = T
  >(params: $P.Y<N, T, X>): params is [N, T | Yatable<T, X>] {
    return typeof params[0] === "string";
  }

  export function tagged<T extends DataStructure>(
    thing: T
  ): thing is Tag<Tag.Name, T> {
    return yatabl_tag in thing;
  }
}

namespace $P {
  export type Y<N extends Tag.Name, T extends DataStructure, X = T> =
    | [T | Yatable<T, X>]
    | [N, T | Yatable<T, X>];

  export type T<N extends Tag.Name, T extends DataStructure> = [T] | [N, T];
}

//#endregion

//#region Types

export type DataStructure =
  | Record<string, unknown>
  | Record<string | number | symbol, unknown>
  | unknown[];

export type Untag<T extends Tag<Tag.Name, DataStructure>> = T extends Tag<
  Tag.Name,
  infer U
>
  ? U
  : never;

export type Tag<I extends Tag.Name, T extends DataStructure> = Tag._<T, I>;
export namespace Tag {
  export type Id = string | symbol;

  export type Name = Id | undefined;

  export type _<T extends DataStructure, N extends Name = undefined> = T &
    Tagged<T, N>;

  export type Anon<T extends DataStructure> = _<T>;
}

export type Yatable<T extends DataStructure, U = T> = (thing: U) => T;

export type Container<T> = { value: T };

//#endregion

//#region Tagging and Utilities

// tag

type Switch<T, U = unknown> = unknown extends U ? T : U;

/**
 * _Overload 1: Yatable only, with specified input type_
 * @param yatable
 */
export function tag<T extends DataStructure, U>(
  yatable: Yatable<T, U>
): Yatable<Tag.Anon<T>, Switch<T, U>>;

/**
 * _Overload 2: Thing only_
 * @param thing
 */
export function tag<T extends DataStructure>(thing: T): Tag.Anon<T>;

/**
 * _Overload 3: Identifier and yatable, with specified input type_
 * @param identifier
 * @param yatable
 */
export function tag<const I extends Tag.Id, T extends DataStructure, U>(
  identifier: I,
  yatable: Yatable<T, U>
): Yatable<Tag<I, T>, Switch<T, U>>;

/**
 * _Overload 4: Identifier and thing_
 * @param identifier
 * @param thing
 */
export function tag<const I extends Tag.Id, T extends DataStructure>(
  identifier: I,
  thing: T
): Tag<I, T>;

/**
 * Internal implementation
 */
export function tag<const I extends Tag.Id, T extends DataStructure, X>(
  ...params: $P.Y<I, T, X>
) {
  if ($guard.yatable(params)) {
    // name param was provided
    const [name, thingOrYatable] = params;

    switch (typeof thingOrYatable) {
      // thing
      case "object": {
        return Tagged.$tag(name, thingOrYatable);
      }
      // yatable
      case "function": {
        return (struct: X) => Tagged.$tag(name, thingOrYatable(struct));
      }
    }
  } else {
    // name param was not provided
    const [thingOrYatable] = params;

    switch (typeof thingOrYatable) {
      // thing
      case "object": {
        return Tagged.$tag(thingOrYatable);
      }
      // yatable
      case "function": {
        return (struct: X) => Tagged.$tag(thingOrYatable(struct));
      }
    }
  }
}

/**
 * Escape hatch used to remove tags and revert back to the structural type system
 * @param tagged thing to untag
 * @returns untagged thing
 */
export function untag<T extends DataStructure>(tagged: Tag<Tag.Name, T>) {
  return tagged[yatabl_tag].thing;
}

export function getIdentifier<N extends Tag.Name>(
  tagged: Tag<N, DataStructure>
) {
  return tagged[yatabl_tag].name;
}

// isTagged

export function isTagged<T extends DataStructure>(
  thing: T | Tag<Tag.Name, T>
): thing is Tag<Tag.Name, T>;
export function isTagged<const I extends Tag.Id, T extends DataStructure>(
  identifier: I,
  thing: T
): thing is Tag<I, T>;
/**
 * Internal implementation
 */
export function isTagged<const I extends Tag.Id, T extends DataStructure>(
  ...params: $P.T<I, T>
) {
  if ($guard.tag(params)) {
    const [thing] = params;
    return $guard.tagged(thing);
  } else {
    const [name, thing] = params;
    return $guard.tagged(thing) && thing[yatabl_tag].name === name;
  }
}

/**
 * no-op yatable that represents a type as an identity function.
 * Use this when you don't need to do any processing (validation or transformation)
 * @returns identity function that casts anything passed in to type T
 */
export function yatable<T extends DataStructure>(): Yatable<T> {
  return (thing: T) => thing;
}

export function container<T>(value: T): Container<T> {
  return { value };
}

//#endregion
