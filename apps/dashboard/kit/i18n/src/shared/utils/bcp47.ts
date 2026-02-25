/**
 * Typescript version of the bcp47.js library
 * @see https://github.com/gagle/node-bcp47/blob/master/lib/index.js
 * Last updated: 2025-09-28
 */

export interface Bcp47Extension {
    singleton: string;
    extension: string[];
}

export interface Bcp47Language {
    language: string | null;
    extlang: string[];
}

export interface Bcp47Langtag {
    language: Bcp47Language;
    script: string | null;
    region: string | null;
    variant: string[];
    extension: Bcp47Extension[];
    privateuse: string[];
}

export interface Bcp47Grandfathered {
    irregular: string | null;
    regular: string | null;
}

export interface Bcp47LanguageTag {
    langtag: Bcp47Langtag;
    privateuse: string[];
    grandfathered: Bcp47Grandfathered;
}

function parse(tag: string): Bcp47LanguageTag | null {
    var re =
        /^(?:(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))$|^((?:[a-z]{2,3}(?:(?:-[a-z]{3}){1,3})?)|[a-z]{4}|[a-z]{5,8})(?:-([a-z]{4}))?(?:-([a-z]{2}|\d{3}))?((?:-(?:[\da-z]{5,8}|\d[\da-z]{3}))*)?((?:-[\da-wy-z](?:-[\da-z]{2,8})+)*)?(-x(?:-[\da-z]{1,8})+)?$|^(x(?:-[\da-z]{1,8})+)$/i;

    /*
  /
  ^
    (?:
      (
        en-GB-oed | i-ami | i-bnn | i-default | i-enochian | i-hak | i-klingon |
        i-lux | i-mingo | i-navajo | i-pwn | i-tao | i-tay | i-tsu | sgn-BE-FR |
        sgn-BE-NL | sgn-CH-DE
      ) |
      (
        art-lojban | cel-gaulish | no-bok | no-nyn | zh-guoyu | zh-hakka |
        zh-min | zh-min-nan | zh-xiang
      )
    )
  $
  |
  ^
    (
      (?:
        [a-z]{2,3}
        (?:
          (?:
            -[a-z]{3}
          ){1,3}
        )?
      ) |
      [a-z]{4} |
      [a-z]{5,8}
    )
    (?:
      -
      (
        [a-z]{4}
      )
    )?
    (?:
      -
      (
        [a-z]{2} |
        \d{3}
      )
    )?
    (
      (?:
        -
        (?:
          [\da-z]{5,8} |
          \d[\da-z]{3}
        )
      )*
    )?
    (
      (?:
        -
        [\da-wy-z]
        (?:
          -[\da-z]{2,8}
        )+
      )*
    )?
    (
      -x
      (?:
        -[\da-z]{1,8}
      )+
    )?
  $
  |
  ^
    (
      x
      (?:
        -[\da-z]{1,8}
      )+
    )
  $
  /i
  */

    var res = re.exec(tag);
    if (!res) return null;

    res.shift();
    var t;

    // langtag language
    var language: string | null = null;
    var extlang: string[] = [];
    if (res[2]) {
        t = res[2].split('-');
        language = t.shift() || null;
        extlang = t;
    }

    // langtag variant
    var variant: string[] = [];
    if (res[5]) {
        variant = res[5].split('-');
        variant.shift();
    }

    // langtag extension
    var extension: Bcp47Extension[] = [];
    if (res[6]) {
        t = res[6].split('-');
        t.shift();

        var singleton: string | undefined;
        var ext: string[] = [];

        while (t.length) {
            var e: string | undefined = t.shift();
            if (e && e.length === 1) {
                if (singleton) {
                    extension.push({
                        singleton: singleton,
                        extension: ext,
                    });
                    singleton = e;
                    ext = [];
                } else {
                    singleton = e;
                }
            } else if (e) {
                ext.push(e);
            }
        }

        if (singleton) {
            extension.push({
                singleton: singleton,
                extension: ext,
            });
        }
    }

    // langtag privateuse
    var langtagPrivateuse: string[] = [];
    if (res[7]) {
        langtagPrivateuse = res[7].split('-');
        langtagPrivateuse.shift();
        langtagPrivateuse.shift();
    }

    // privateuse
    var privateuse: string[] = [];
    if (res[8]) {
        privateuse = res[8].split('-');
        privateuse.shift();
    }

    return {
        langtag: {
            language: {
                language: language,
                extlang: extlang,
            },
            script: res[3] || null,
            region: res[4] || null,
            variant: variant,
            extension: extension,
            privateuse: langtagPrivateuse,
        },
        privateuse: privateuse,
        grandfathered: {
            irregular: res[0] || null,
            regular: res[1] || null,
        },
    };
}

export { parse };
