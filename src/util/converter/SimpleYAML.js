const DOCUMENT_START = /(?:\r\n|\n|\r)---(?:\r\n|\n|\r)/g;
const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
// const COMMENT_START = /( # )/g;

// TODO
class SimpleYAML {

    parse(input) {
        const output = [];

        const documents = input.split(DOCUMENT_START);
        for (const doc of documents) {
            const lines = doc.split(LNBR_SEQ);
            const docRes = {};

            for (let i = 0; i < lines.length; ++i) {
                // const line = lines[i];

            }

            output.push(docRes);
        }

        return output;
    }

}

export default new SimpleYAML();
