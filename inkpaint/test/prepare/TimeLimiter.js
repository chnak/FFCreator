'use strict';

describe('InkPaint.prepare.TimeLimiter', function ()
{
    it('should limit to stop after time from beginFrame()', function (done)
    {
        const limit = new InkPaint.prepare.TimeLimiter(3);

        limit.beginFrame();
        for (let i = 0; i < 20; ++i)
        {
            expect(limit.allowedToUpload()).to.be.true;
        }

        setTimeout(function ()
        {
            expect(limit.allowedToUpload()).to.be.false;

            limit.beginFrame();

            expect(limit.allowedToUpload()).to.be.true;

            done();
        }, 4);
    });
});
