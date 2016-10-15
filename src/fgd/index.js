import tokenizer from './tokenizer';
import parser from './parser';
import transformer from './transformer';

export default function(input) {
    const tokens = tokenizer(input);
    const ast = parser(tokens);
    return transformer(ast);
};
