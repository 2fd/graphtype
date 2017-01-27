# graphschema
Generator of TypeScripts definitions for GraphQL

## Translations

### TypeScripts definitions (.d.ts)

#### Scalars

```graphql
    scalar Boolean;
    scalar Int;
    scalar String;
```

```typescript
    /**
     * Represents `true` or `false` values.
     */
    export type Boolean = boolean;

    /**
     * Represents non-fractional signed whole numeric values. Int can represent values 
     * between -(2^31) and 2^31 - 1.
     */
    export type Int = number;

    /**
     * Represents textual data as UTF-8 character sequences. This type is most often 
     * used by GraphQL to represent free-form human-readable text.
     */
    export type String = string;
```

#### Enums

```graphql
    enum __TypeKind {
        SCALAR
        OBJECT
        INTERFACE
        UNION
        ENUM
        INPUT_OBJECT
        LIST
        NON_NULL
    }
```

```typescript
    /**
     * An enum describing what kind of type a given `__Type` is.
     */
    export type __TypeKind = (

        /**
         * Indicates this type is a scalar.
         */
        "SCALAR" |

        /**
         * Indicates this type is an object. `fields` and `interfaces` are valid fields.
         */
        "OBJECT" |

        /**
         * Indicates this type is an interface. `fields` and `possibleTypes` are valid 
         * fields.
         */
        "INTERFACE" |

        /**
         * Indicates this type is a union. `possibleTypes` is a valid field.
         */
        "UNION" |

        /**
         * Indicates this type is an enum. `enumValues` is a valid field.
         */
        "ENUM" |

        /**
         * Indicates this type is an input object. `inputFields` is a valid field.
         */
        "INPUT_OBJECT" |

        /**
         * Indicates this type is a list. `ofType` is a valid field.
         */
        "LIST" |

        /**
         * Indicates this type is a non-null. `ofType` is a valid field.
         */
        "NON_NULL"
    );
```

#### Unions

```graphql
    union ProjectCardItem = Issue | PullRequest;
```

```typescript
    /**
     * Types that can be inside Project Cards.
     */
    export type ProjectCardItem = Issue | PullRequest;
```

#### Interfaces

```graphql
    interface Node {
        id: ID!
    }
```

```typescript
    /**
     * An application user.
     */
    export interface Node {

        /**
         * .ID of the node.
         */
        id: NonNull<ID>;
    }
```

#### Types

```graphql
    type User implements Node {
        id: ID!
        email: String!
        name: String
        lastName: String
        friends: [ID!]!
    }
```

```typescript
    /**
     * An application user.
     */
    export interface User extends Node {

        /**
         * ID of the user.
         */
        id: NonNull<ID>;

        /**
         * contact email of the user.
         */
        email: NonNull<String>;

        /**
         * name of the user.
         */
        name?: Optional<String>;

        /**
         * last name of the user.
         */
        lastName?: Optional<String>;

        /**
         * list of friend´s ID of the user.
         */
        friends: NonNull<List<NonNull<ID>>>;
    }
```

#### Inputs

```graphql
    input NewUser {
        email: String!
        name: String
        lastName: String
        friends: [ID!] = []
    }
```

```typescript
    /**
     * An application user.
     */
    export interface NewUser {

        /**
         * contact email of the user.
         */
        email: NonNull<String>;

        /**
         * name of the user.
         */
        name?: Optional<String>;

        /**
         * last name of the user.
         */
        lastName?: Optional<String>;

        /**
         * @default []
         *
         * list of friend´s ID of the user.
         */
        friends?: Optional<List<NonNull<ID>>>;
    }
```