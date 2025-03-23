// import Logger from "../log/Logger.js";

const PARSER = new DOMParser();

// TODO minify results after parsing
class XML {

    parse(input) {
        const xml = PARSER.parseFromString(input, "text/xml");
        // handle error
        const parsererror = xml.querySelector("parsererror");
        if (parsererror != null) {
            throw new Error(`Parser error in XML: ${parsererror.textContent}`);
        }
        // fetch data
        return this.#parseChildNodes(xml);
    }

    #parseChildNodes(currentNode) {
        const res = [];
        for (const childNode of currentNode.childNodes) {
            const nodeType = childNode.nodeType;

            if (nodeType === Node.TEXT_NODE) {
                res.push(childNode.textContent.trim());
                continue;
            }

            if (nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            const nodeObj = {name: childNode.tagName};
            for (const attr of childNode.attributes) {
                nodeObj[`_${attr.name}`] = attr.value;
            }
            nodeObj["children"] = this.#parseChildNodes(childNode);
            res.push(nodeObj);
        }
        return res.filter((el) => !!el);
    }

}

export default new XML();

/*

<bookstore test="arg" class="super rot" id="haha">
    <book>
        <title>Everyday Italian</title>
        <author>Giada De Laurentiis</author>
        <year>2005</year>
        <year>2015</year>
        lahfoequhfeq
    </book>
    tfligizf
</bookstore>

{
  "bookstore": {
    "__text": "tfligizf".
    "_test": "arg",
    "_class": "super rot",
    "_id": "haha",
    "book": {
      "__text": "lahfoequhfeq",
      "title": "Everyday Italian",
      "author": "Giada De Laurentiis",
      "year": [
        "2005",
        "2015"
      ]
    }
  }
}

the basic structure of the parsed xml might look like this before minimizing:

[
    {
        "name": "bookstore",
        "_test": "arg",
        "_class": "super rot",
        "_id": "haha",
        "children": [
            {
                "name": "book",
                "children": [
                    {
                        "name": "title",
                        "children": [
                            "Everyday Italian"
                        ]
                    },
                    {
                        "name": "author",
                        "children": [
                            "Giada De Laurentiis"
                        ]
                    },
                    {
                        "name": "year",
                        "children": [
                            "2005"
                        ]
                    },
                    {
                        "name": "year",
                        "children": [
                            "2015"
                        ]
                    },
                    "lahfoequhfeq"
                ]
            },
            "tfligizf"
        ]
    }
]

*/
