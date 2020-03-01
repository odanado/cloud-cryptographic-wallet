interface TwoOverloads {
  (...args: any): any;
  (...args: any): any;
}

type Overloads<T> = T extends {
  (...args: infer A1): infer R1;
  (...args: infer A2): infer R2;
  (...args: infer A3): infer R3;
  (...args: infer A4): infer R4;
}
  ? [
      (...args: A1) => R1,
      (...args: A2) => R2,
      (...args: A3) => R3,
      (...args: A4) => R4
    ]
  : T extends {
      (...args: infer A1): infer R1;
      (...args: infer A2): infer R2;
      (...args: infer A3): infer R3;
    }
  ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3]
  : T extends {
      (...args: infer A1): infer R1;
      (...args: infer A2): infer R2;
    }
  ? [(...args: A1) => R1, (...args: A2) => R2]
  : T extends {
      (...args: infer A1): infer R1;
    }
  ? [(...args: A1) => R1]
  : any;

type OverloadedArgsType<T> = T extends {
  (...args: infer A1): any;
  (...args: infer A2): any;
}
  ? A1 & A2
  : never;

declare namespace jest {
  function overloadSpyOn<
    T extends {},
    M extends FunctionPropertyNames<Required<T>>
  >(
    object: T,
    method: M
  ): Required<T>[M] extends TwoOverloads
    ? SpyInstance<
        ReturnType<Required<T>[M]>,
        OverloadedArgsType<Required<T>[M]>
      >
    : never;
}
