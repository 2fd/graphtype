#!  /usr/bin/env node
import {ArgvInput, ColorConsoleOutput} from '@2fd/command';
import {GraphTypeCommand} from '../lib/command';

(new GraphTypeCommand)
    .handle(
        new ArgvInput(process.argv),
        new ColorConsoleOutput
    );