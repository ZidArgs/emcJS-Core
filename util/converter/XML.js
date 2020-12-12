// import Logger from "../Logger.js";

const PARSER = new DOMParser();

class XML {

    parse(input) {
        const output = {};
        const xml = PARSER.parseFromString(input, "text/xml");
        // TODO match xml to object like shown below
        output.xml = xml;
        return output;
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
    "#": "tfligizf".
    "#test": "arg",
    "#class": "super rot",
    "#id": "haha",
    "book": {
      "#": "lahfoequhfeq",
      "title": "Everyday Italian",
      "author": "Giada De Laurentiis",
      "year": [
        "2005",
        "2015"
      ]
    }
  }
}

*/
