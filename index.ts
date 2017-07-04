import { sslTest, dnssec, headers } from './infr';

import * as assert from 'assert';
import isIPv6 = require('is-ipv6-node');

const endpoints = sslTest({ host: 'metacode.biz' }).then(result => result.endpoints);

function fail(message: string): never {
    throw new assert.AssertionError({ message });
}

export async function testHighGrades() {
    assert.ok(
        (await endpoints).every(endpoint => endpoint.grade === 'A+'),
        'All endpoints must have grade A+.'
    );
}

export async function testAlpnSupport() {
    assert.ok(
        (await endpoints).every(endpoint => endpoint.details.supportsAlpn),
        'All endpoints must support ALPN/H2.'
    );
}

export async function testIPv6Support() {
    assert.ok(
        (await endpoints).some(endpoint => isIPv6(endpoint.ipAddress)),
        'Must have at least one IPv6 address.'
    );
}

export async function testDnssecPositive() {
    const result = await dnssec({ host: 'metacode.biz' });
    assert.ok(result.secure);
}

const headersResult = headers({ url: 'https://metacode.biz' });

export async function testStrictTransportSecurity() {
    const sts = (await headersResult).get('strict-transport-security');
    if (!sts) {
        fail('STS header should be set.');
    } else {
        assert.ok('preload' in sts, 'STS must be preloaded');
        assert.ok('includeSubDomains' in sts, 'STS must include subdomains.');
        assert.ok(Number(sts['max-age']) >= 31536000, 'STS must be valid for long time.');
    }
}

export async function testXXSSProtection() {
    const xss = (await headersResult).get('x-xss-protection');
    if (!xss) {
        fail('XSS header should be set.');
    } else {
        assert.ok('1' in xss, 'XSS must be enabled.');
        assert.equal('block', xss['mode'], 'XSS must be in mode block.');
        assert.ok('report' in xss, 'XSS report url must be present.');
    }
}

export async function testXContentTypeOptions() {
    const cto = (await headersResult).get('x-content-type-options');
    if (!cto) {
        fail('XCTO header should be set.');
    } else {
        assert.ok('nosniff' in cto, 'XCTO must be enabled.');
    }
}

export async function testXFrameOptions() {
    const xfo = (await headersResult).get('x-frame-options');
    if (!xfo) {
        fail('XFO header should be set.');
    } else {
        assert.ok('DENY' in xfo, 'XFO must be enabled.');
    }
}
