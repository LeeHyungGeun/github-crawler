import request from 'request';
import cheerio from 'cheerio';
import _ from 'lodash';
import path from 'path';
import URL from 'url';
import fs from 'fs';

class Crawler {
    constructor(domain = '', keyword = '') {
        // Functions
        this.start = this.start.bind(this);
        this.requestUrl = this.requestUrl.bind(this);
        this.getLinksBySelector = this.getLinksBySelector.bind(this);
        this.isVisitedUrl = this.isVisitedUrl.bind(this);
        this.addVisitedUrl = this.addVisitedUrl.bind(this);
        this.resolveUrl = this.resolveUrl.bind(this);
        this.addPage = this.addPage.bind(this);
        this.writeFile = this.writeFile.bind(this);
        this.checkFile = this.checkFile.bind(this);

        // State
        this.domain = domain;
        this.keyword = keyword;
        this.visitedUrls = [];
        this.pages = [];

        // Start
        this.init = this.init.bind(this);
        this.start(domain)
        .then(() => {
            // console.log(this.pages);
        });
    }
    init(domain = '') {
        const result = this.start(domain);
        result.then(() => { console.log('finished'); console.log(this.pages); })
    }

    /* New Version */
    async start(url = null) {
        url = this.resolveUrl(url); 
        if (this.isVisitedUrl(url)) {
            return false;
        }
        this.addVisitedUrl(url);
        const body = await this.requestUrl(url);
        // if Raw page
        const href = this.isContainsRawPage(body, '#raw-url');
        if (href) {
            const url = this.resolveUrl(href);
            const body = await this.requestUrl(url);
            // if searched.
            if (this.checkFile(body, this.keyword)) {
                this.addPage({
                    url,
                    body
                });
                this.writeFile(url, body);
            }
        }
        // if Link page
        else {
            const selector = '.js-active-navigation-container .js-navigation-item .content';
            const hrefs = this.getLinksBySelector(body, selector);    
            _.map(hrefs, (href) => {
                this.start(href);
            });
        }
    }
    // Check an url whether is visited or not
    isVisitedUrl(url) {
        return _.includes(this.visitedUrls, url);
    }
    // Add a visited Url
    addVisitedUrl(url) {
        if (!this.isVisitedUrl(url)) {
            this.visitedUrls.push(url);
        }
    }
    // make a url by domain.
    resolveUrl(url) {
        return path.isAbsolute(url) ? URL.resolve(this.domain, url) : url;
    }
    // return href of raw page
    isContainsRawPage(body = '', selector = '') {
        const $ = cheerio.load(body);
        const $selector = $(`${selector}`);
        if (!$selector.length) {
            return false;
        }
        const href = $selector[0].attribs.href;
        return href;
    }
    // get url and return body of the page
    requestUrl(url = null) {
        return new Promise(function(resolve, reject) {
            request({
                url
            }, (err, res, body) => {
                resolve(body);
            })
        });
    }
    // get body and selector, and return hrefs
    getLinksBySelector(body = '', selector = '') {
        const $ = cheerio.load(body);
        const $selector = $(`${selector}`);
        const hrefs = [];
        if ($selector.length > 0) {
            const elements = $selector.find('a');
            _.map(elements, (element, key) => {
                hrefs.push($(element).attr('href'));
            });
        }
        return hrefs;
    }
    checkFile(body = '', keyword = '') {
        const regexp = new RegExp(`${keyword}`, 'igm');
        return regexp.test(body);// ? regexp.exec(body).input : regexp.test(body);
    }
    addPage(url = '', body = '') {
        this.pages.push({
            url,
            body
        });
    }
    writeFile(url = '', body = '') {
        const pathes = url.split('/');
        const fileName = pathes[pathes.length - 1];
        fs.writeFile(path.resolve(__dirname, './files', `./${fileName}`), body, 'utf-8', (err) => {
            if (err) throw err;
        });
    }
    /* /New Version */
}
export default Crawler;