String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
};

const mp_exp_open = `//div[@class='block block--time-to-purchase']//div[@class='value__val']`;
const p_strike_open = `//div[@class='block block--strike-price']//div[@class='value__val']`;
const p_type_switch = `(//div[@class='block block--expiration-inputs']|//div[@class='block block--time-to-purchase'])//div[@class='control-buttons__wrapper' or 'control__buttons buttons']//a`;
const p_strike_switch = `//div[@class='block__title-sbtn sbtn--strike-price sbtn']//input`;

class PlatformExplorer {
    static evalXPath = (path) => {
        var res = [];
        var XPathRes = window.document.evaluate(
            path,
            window.document,
            null,
            XPathResult.ANY_TYPE,
            null
        );
        var e = XPathRes.iterateNext();
        while (e) {
            res.push(e);
            e = XPathRes.iterateNext();
        }
        return res;
    };

    static tryFun(callback) {
        try {
            return callback();
        } catch (e) {}
    }

    static get platform() {
        return ["olymptrade.com", "pocketoption.com"].indexOf(
            window.location.host.replace(/^m./g, "")
        );
    }

    static get timeInputPaths() {
        return [
            "(//input)[last()]",
            `//div[@class='block block--expiration-inputs']//div[@class='value__val'] | //li[@class='list__item list__item--active']//span[@class='list__k']`,
        ];
    }

    static get timeText() {
        var click =
            !PlatformExplorer.evalXPath(
                PlatformExplorer.timeInputPaths[PlatformExplorer.platform]
            )[0] && PlatformExplorer.platform == 1;
        if (click) {
            PlatformExplorer.tryFun(() => {
                PlatformExplorer.evalXPath(mp_exp_open)[0].click();
            });
        }
        var e = PlatformExplorer.evalXPath(
            PlatformExplorer.timeInputPaths[PlatformExplorer.platform]
        )[0];
        var res = (e.value ? e.value : e.textContent).replace(/\s\s+/g, " ");
        if (click) {
            PlatformExplorer.tryFun(() => {
                PlatformExplorer.evalXPath(mp_exp_open)[0].click();
            });
        }
        return res;
    }

    static translateHours(hours, delta) {
        delta = delta ? delta : 0;
        hours = parseInt(hours) + 24 + delta;
        hours = hours - 24 * parseInt(hours / 24);
        return hours;
    }

    static exp = (delta) => {
        delta = delta ? delta : 0;
        var t = PlatformExplorer.timeText;
        switch (PlatformExplorer.platform) {
            case 0:
                var parsed = /(\d\d):(\d\d)/g.exec(PlatformExplorer.timeText);
                return parsed
                    ? `до ${(
                          "0" +
                          PlatformExplorer.translateHours(
                              parsed[1],
                              delta
                          ).toString()
                      ).slice(-2)}:${parsed[2]}`
                    : `на ${PlatformExplorer.timeText}`;
            case 1:
                var parsed = /(\d\d):(\d\d):(\d\d)/g.exec(
                    PlatformExplorer.timeText
                );
                return (
                    "на " +
                    (parsed
                        ? (parseInt(parsed[1]) ? `${parsed[1]} ч. ` : ``) +
                          (parseInt(parsed[2]) || parseInt(parsed[1])
                              ? `${parsed[2]} м. `
                              : ``) +
                          `${parsed[3]} с.`
                        : PlatformExplorer.timeText)
                );
        }
    };

    static get assetElemPaths() {
        return [
            `//span[@class='pair-assets-select-title']`,
            `//span[@class='current-symbol']`,
        ];
    }

    static get assetElement() {
        return PlatformExplorer.evalXPath(
            PlatformExplorer.assetElemPaths[PlatformExplorer.platform]
        )[0];
    }

    static get ass() {
        return PlatformExplorer.assetElement.textContent;
    }

    static get strikeElemPaths() {
        return [
            `//div[@class='chart-strikes_inner']//div`,
            `//div[@class='block block--strike-price']//ul//span[@class='list__c']`,
        ];
    }

    static get strikes() {
        var click =
            !PlatformExplorer.evalXPath(
                PlatformExplorer.strikeElemPaths[PlatformExplorer.platform]
            )[0] && PlatformExplorer.platform == 1;
        var swc =
            !PlatformExplorer.evalXPath(p_strike_switch)[0] &&
            PlatformExplorer.platform == 1;
        if (click) {
            if (swc) {
                PlatformExplorer.tryFun(() => {
                    PlatformExplorer.evalXPath(p_type_switch)[0].click();
                    PlatformExplorer.evalXPath(p_strike_switch)[0].click();
                    PlatformExplorer.evalXPath(p_strike_switch)[0].click();
                });
            }
            PlatformExplorer.tryFun(() => {
                PlatformExplorer.evalXPath(p_strike_open)[0].click();
            });
        }
        var res = PlatformExplorer.evalXPath(
            PlatformExplorer.strikeElemPaths[PlatformExplorer.platform]
        )
            .map((e) => e.textContent)
            .sort((a, b) => (parseFloat(a) <= parseFloat(b) ? -1 : 1));
        if (click) {
            PlatformExplorer.tryFun(() => {
                PlatformExplorer.evalXPath(p_strike_open)[0].click();
            });
            if (swc) {
                PlatformExplorer.tryFun(() => {
                    PlatformExplorer.evalXPath(p_type_switch)[0].click();
                });
            }
        }
        return res;
    }

    static get currentStrikePaths() {
        return [
            `//*[local-name()='line' and @class='chart-strike_line' and contains(@style, 'visibility: visible')]//parent::*//parent::*//parent::div`,
            `//div[@class='block block--strike-price']//div[@class='value__val']`,
        ];
    }

    static get stv() {
        var click =
            !PlatformExplorer.evalXPath(
                PlatformExplorer.currentStrikePaths[PlatformExplorer.platform]
            )[0] && PlatformExplorer.platform == 1;
        if (click) {
            PlatformExplorer.tryFun(() => {
                PlatformExplorer.evalXPath(p_type_switch)[0].click();
                PlatformExplorer.evalXPath(p_strike_switch)[0].click();
                PlatformExplorer.evalXPath(p_strike_switch)[0].click();
            });
        }
        var res = PlatformExplorer.evalXPath(
            PlatformExplorer.currentStrikePaths[PlatformExplorer.platform]
        )[0].textContent;
        if (click) {
            PlatformExplorer.tryFun(() => {
                PlatformExplorer.evalXPath(p_type_switch)[0].click();
            });
        }
        return res;
    }

    static get stn() {
        return (
            PlatformExplorer.strikes.indexOf(PlatformExplorer.stv) -
            parseInt(PlatformExplorer.strikes.length / 2)
        );
    }

    static get topElemPaths() {
        return [`//div[@class='trade-frame__content-graph']`, `//div[@class='chart-item']`];
    }

    static get topElement() {
        return PlatformExplorer.evalXPath(
            PlatformExplorer.topElemPaths[PlatformExplorer.platform]
        )[0];
    }
}

export default PlatformExplorer;
