import { Introspection, Schema } from './interface';
import { introspectionQuery } from './introspection';
import { createReadableSchemaDefinition } from './typescript';
import {
    BooleanFlag,
    Command,
    InputInterface,
    ListValueFlag,
    NoParams,
    OutputInterface,
    ValueFlag,
} from '@2fd/command';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';

export interface IFlags {
    endpoint: string;
    headers: string[];
    queries: string[];
    scalarAlias: string[];
    scalarNumbers: string[];
    schemaFile: string;
    output: string;
    version: boolean;
};
export interface IParams { };
export type Input = InputInterface<IFlags, IParams>;
export type Output = OutputInterface;

export class GraphTypeCommand extends Command<IFlags, IParams> {

    description = 'Generator of TypeScripts definitions for GraphQL';

    params = new NoParams();

    flags = [
        new ValueFlag('endpoint', ['-e', '--endpoint'], 'Graphql http endpoint ["https://domain.com/graphql"].'),
        new ListValueFlag(
            'headers', ['-x', '--header'],
            'HTTP header for request (use with --endpoint). ["Authorization: Token cb8795e7"].'
        ),
        new ListValueFlag(
            'queries', ['-q', '--query'],
            'HTTP querystring for request (use with --endpoint) ["token=cb8795e7"].'
        ),
        new ValueFlag('schemaFile', ['-s', '--schema'], 'Graphql Schema file ["./schema.json"].'),
        new ValueFlag('output', ['-o', '--output'], 'Output file (otherwise write on stdout).'),
        new ListValueFlag(
            'scalarNumbers', ['-n', '--number-alias'],
            'Scalars that must be represented as numbers ["UnsignedInt"].'
        ),
        new ListValueFlag(
            'scalarAlias', ['-a', '--alias'],
            'Scalars that must be represented as alias of other types ["NumberOrString=number | string"].'
        ),
        new BooleanFlag('version', ['-V', '--version'], 'Show graphtype version.'),
    ];


    action(input: Input, output: Output) {

        return Promise.all<any>([
            this.getOutputStream(input),
            this.getSchema(input),
            this.getAlias(input),
        ])
            .then(([out, schema, alias]: [NodeJS.WritableStream, Schema, any]) => {
                return new Promise<NodeJS.WritableStream>((resolve, reject) => {
                    const readable = createReadableSchemaDefinition(schema, alias);
                    readable.on('error', reject);
                    readable.on('end', () => resolve(out));
                    readable.pipe(out);
                });
            })
            .then((out) => {
                if (out !== process.stdout)
                    out.end();

                process.exit(0);
            })
            .catch(err => {
                output.error('');
                output.error('%c %s', 'color:red', err.message);
                output.error('');
                output.error('%c %s', 'color:grey', err.stack);
                output.error('');
                process.exit(1);
            });
    }

    getAlias(input: Input) {

        let alias: any = {};

        if (input.flags.scalarNumbers)
            input.flags.scalarNumbers.forEach(scalarName => {
                alias[scalarName] = 'number';
            });

        if (input.flags.scalarAlias)
            input.flags.scalarAlias.forEach(scalarAlias => {
                const [scalarName, scalarRepresentation] = scalarAlias.split('=');
                alias[scalarName] = scalarRepresentation;
            });

        return alias;
    }

    getOutputStream(input: Input): NodeJS.WritableStream {

        if (input.flags.output)
            return fs.createWriteStream(path.resolve(input.flags.output));

        return process.stdout;
    }

    getSchema(input: Input): Promise<Schema> {

        if (input.flags.schemaFile) {

            return new Promise((resolve, reject) => {
                try {
                    const schemaPath = path.resolve(input.flags.schemaFile);
                    const introspection: Introspection = require(schemaPath);
                    resolve(introspection.data.__schema);
                } catch (err) {
                    reject(err);
                }
            });

        } else if (input.flags.endpoint) {

            let options = {
                url: input.flags.endpoint,
                method: 'POST',
                json: true,
                body: { query: introspectionQuery }
            } as any;

            options.headers = input.flags.headers.reduce((result: any, header: string) => {
                const [name, value] = header.split(': ', 2);
                result[name] = value;
                return result;
            }, {});

            options.qs = input.flags.queries.reduce((result: any, query: string) => {
                const [name, value] = query.split('=', 2);
                result[name] = value;
                return result;
            });

            return new Promise((resolve, reject) => {
                request(options, (err, _, introspection: Introspection) => err ?
                    reject(err) : resolve(introspection.data.__schema));
            });

        } else {
            return Promise.reject(
                new Error('Endpoint (--endpoint, -e) or Schema File (--schema, -s) are require.')
            );
        }
    }
}