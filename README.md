# graphschema
Generator of TypeScripts definitions for GraphQL

## Install

```bash
    npm install -g @2fd/graphtype
```

## Use

### Generate definitions from live endpoint

```bash
    > graphtype -e http://localhost:8080/graphql -o ./doc/schema.d.ts
```

### Generate definitions from json file

```bash
    > graphtype -s ./schema.json -o ./doc/schema.d.ts
```

> `./schema.json` contains the result of [GraphQL introspection query](https://github.com/2fd/graphdoc/blob/gh-pages/introspection.graphql)


### Add scalars that must be represented as numbers

```bash
    > graphtype -e http://localhost:8080/graphql -n "UnsignedInt"
```

```typescript
    /**
     * Represents `true` or `false` values.
     */
    export type UnsignedInt = number;
```

### Add scalars that must be represented as numbers

```bash
    > graphtype -e http://localhost:8080/graphql -n "UnsignedInt"
```

```typescript
    // ...
    export type UnsignedInt = number;
    // ...
```

### Add scalars that must be represented as alias of other types

```bash
    > graphtype -e http://localhost:8080/graphql -s "NumberOrString=number | string"
```

```typescript
    // ...
    export type NumberOrString = number | string;
    // ...
```

### Help

```bash

    > graphtype -h

    Generator of TypeScripts definitions for GraphQL v1.0.0

    Usage: graphtype [OPTIONS]

     [OPTIONS]:
    -e, --endpoint        Graphql http endpoint ["https://domain.com/graphql"].
    -x, --header          HTTP header for request (use with --endpoint). ["Authorization: Token cb8795e7"].
    -q, --query           HTTP querystring for request (use with --endpoint) ["token=cb8795e7"].
    -s, --schema          Graphql Schema file ["./schema.json"].
    -o, --output          Output file (otherwise write on stdout).
    -n, --number-alias    Scalars that must be represented as numbers ["UnsignedInt"].
    -a, --alias           Scalars that must be represented as alias of other types ["NumberOrString=number | string"].
    -V, --version         Show graphtype version.
    -h, --help            Print this help

```

## Translations

### TypeScripts definitions (.d.ts)

* [Scalars](#scalars)
* [Enums](#enums)
* [Unions](#unions)
* [Interfaces](#interfaces)
* [Types](#types)
* [Inputs](#inputs)


#### Scalars

```graphql
    # schema definitions

    scalar Boolean;
    scalar Int;
    scalar String;
```

```typescript
    // typescript output

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
    # schema definitions

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
    // typescript output

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
    # schema definitions

    union ProjectCardItem = Issue | PullRequest;
```

```typescript
    // typescript output

    /**
     * Types that can be inside Project Cards.
     */
    export type ProjectCardItem = Issue | PullRequest;
```

#### Interfaces

```graphql
    # schema definitions

    interface Node {
        id: ID!
    }
```

```typescript
    // typescript output

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
    # schema definitions

    type User implements Node {
        id: ID!
        email: String!
        name: String
        lastName: String
        friends: [ID!]!
    }
```

```typescript
    // typescript output

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
    # schema definitions

    input NewUser {
        email: String!
        name: String
        lastName: String
        friends: [ID!] = []
    }
```

```typescript
    // typescript output

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