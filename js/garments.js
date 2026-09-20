/* 555 STUDIO — garment blueprints.
   Everything is authored in a 1000 x 1000 design space.
   Roles: body (fabric fill) · shade (dark wash) · light (highlight)
          lines (seams, stroked) · stitch (contrast topstitch) · dots (rivets/eyelets)
   Only absolute M / L / C / Q / Z commands are used so paths can be mirrored. */
(function (SD) {
  'use strict';

  /** flip a path across x = 500 */
  function mir(d) {
    return d.replace(/([MLCQZ])|(-?\d*\.?\d+)/g, (function () {
      let cmd = null, i = 0;
      return function (m, c, n) {
        if (c) { cmd = c; i = 0; return c; }
        const isX = i++ % 2 === 0;
        return isX ? String(SD.round(1000 - parseFloat(n), 2)) : n;
      };
    })());
  }
  SD.mirrorPath = mir;

  const st = (d, w, a, cap) => ({ d: d, w: w || 3, a: a == null ? 0.3 : a, cap: cap });
  const sh = (d, a) => ({ d: d, a: a == null ? 0.08 : a });

  /* ─────────────────────────── TEE ─────────────────────────── */
  /* anchors — shoulder (300,250) · cuff (846,362)-(778,448) · underarm (700,424) · hem 846 */
  const TEE_BODY = function (neck) {
    return 'M 300 250 ' + neck +
      ' C 750 262 804 306 850 370' +        /* right sleeve, top edge */
      ' L 786 452' +                        /* cuff */
      ' C 758 442 726 432 700 420' +        /* armhole */
      ' C 706 560 706 700 700 846' +        /* right side */
      ' L 300 846' +                        /* hem */
      ' C 294 700 294 560 300 420' +        /* left side */
      ' C 274 432 242 442 214 452' +
      ' L 150 370' +
      ' C 196 306 250 262 300 250 Z';
  };
  /* shoulder seam → neck hole → shoulder seam */
  const TEE_NECK_F = 'L 416 270 C 432 296 462 310 500 310 C 538 310 568 296 584 270 L 700 250';
  const TEE_NECK_B = 'L 420 268 C 436 286 464 294 500 294 C 536 294 564 286 580 268 L 700 250';
  const TEE_CUFF_L = 'M 178 344 C 190 380 214 412 246 432';
  const TEE_SIDE_L = 'M 300 420 L 300 846 L 354 846 C 342 700 342 540 350 426 Z';
  const TEE_ARM_L = 'M 300 420 C 272 432 242 442 214 452 L 196 428 C 236 424 276 410 300 388 Z';

  const tee = {
    name: 'Boxy Tee', short: 'TEE', kind: 'top',
    views: {
      front: {
        body: [TEE_BODY(TEE_NECK_F)],
        shade: [
          sh(TEE_SIDE_L), sh(mir(TEE_SIDE_L)), sh(TEE_ARM_L, 0.1), sh(mir(TEE_ARM_L), 0.1),
          sh('M 416 270 C 432 296 462 310 500 310 C 538 310 568 296 584 270 L 592 282 C 572 316 540 330 500 330 C 460 330 428 316 408 282 Z', 0.12)
        ],
        light: [sh('M 384 350 C 430 404 570 404 616 350 C 626 470 624 610 612 760 C 566 700 434 700 388 760 C 376 610 374 470 384 350 Z', 0.028)],
        lines: [
          st('M 412 266 C 430 300 460 316 500 316 C 540 316 570 300 588 266', 17, 0.3, 'butt'),
          st('M 404 258 C 424 300 458 326 500 326 C 542 326 576 300 596 258', 3, 0.15, 'butt'),
          st('M 300 250 L 416 270', 2.5, 0.12), st('M 700 250 L 584 270', 2.5, 0.12),
          st(TEE_CUFF_L, 3.5, 0.24), st(mir(TEE_CUFF_L), 3.5, 0.24),
          st('M 302 832 L 698 832', 3, 0.16),
          st('M 396 600 C 406 680 404 760 396 828', 2.5, 0.09),
          st(mir('M 396 600 C 406 680 404 760 396 828'), 2.5, 0.09)
        ],
        print: { x: 352, y: 372, w: 296, h: 368 }
      },
      back: {
        body: [TEE_BODY(TEE_NECK_B)],
        shade: [
          sh(TEE_SIDE_L), sh(mir(TEE_SIDE_L)), sh(TEE_ARM_L, 0.1), sh(mir(TEE_ARM_L), 0.1)
        ],
        light: [],
        lines: [
          st('M 414 264 C 432 290 462 300 500 300 C 538 300 568 290 586 264', 19, 0.28, 'butt'),
          st('M 300 250 L 420 268', 2.5, 0.12), st('M 700 250 L 580 268', 2.5, 0.12),
          st('M 344 318 C 422 344 578 344 656 318', 2.5, 0.1),
          st(TEE_CUFF_L, 3.5, 0.24), st(mir(TEE_CUFF_L), 3.5, 0.24),
          st('M 302 832 L 698 832', 3, 0.16)
        ],
        print: { x: 348, y: 348, w: 304, h: 404 }
      }
    }
  };

  /* ─────────────────── HOODIE / CREWNECK body ─────────────────── */
  /* anchors — shoulder (286,286) · cuff (120,526)-(176,612) · underarm (298,470) · hem 858 */
  const HOOD_BODY =
    'M 286 286' +
    ' L 424 308' +
    ' C 440 332 468 344 500 344' +
    ' C 532 344 560 332 576 308' +
    ' L 714 286' +
    ' C 790 330 848 410 880 526' +
    ' C 872 560 852 592 824 612' +
    ' C 782 570 740 516 702 470' +
    ' C 708 600 708 730 704 858' +
    ' L 296 858' +
    ' C 292 730 292 600 298 470' +
    ' C 260 516 218 570 176 612' +
    ' C 148 592 128 560 120 526' +
    ' C 152 410 210 330 286 286 Z';
  const HOOD_HEM = 'M 296 796 L 704 796 L 704 858 L 296 858 Z';
  const HOOD_CUFF_L = 'M 120 526 L 176 612 L 210 570 L 154 484 Z';
  const HOOD_SLEEVE_SHADE_L = 'M 298 470 C 262 514 220 566 178 610 L 206 572 C 244 528 282 490 306 462 Z';
  const HOOD_SIDE_L = 'M 298 470 L 296 858 L 352 858 C 340 720 340 580 348 478 Z';
  const HOOD_RIB_LINES = (function () {
    let d = '';
    for (let x = 306; x <= 694; x += 18) d += 'M ' + x + ' 802 L ' + x + ' 854 ';
    return d;
  })();
  const CUFF_RIB_L = (function () {
    let d = '';
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      d += 'M ' + SD.round(120 + (154 - 120) * t, 1) + ' ' + SD.round(526 + (484 - 526) * t, 1) +
        ' L ' + SD.round(176 + (210 - 176) * t, 1) + ' ' + SD.round(612 + (570 - 612) * t, 1) + ' ';
    }
    return d;
  })();
  const HOOD_NECK = 'M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302';

  const hoodie = {
    name: 'Hoodie', short: 'HOODIE', kind: 'top',
    views: {
      front: {
        body: [
          'M 362 436 C 278 342 302 158 500 158 C 698 158 722 342 638 436 Z',
          HOOD_BODY
        ],
        shade: [
          sh('M 424 308 C 398 248 402 172 500 172 C 598 172 602 248 576 308 C 560 332 532 344 500 344 C 468 344 440 332 424 308 Z', 0.3),
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12),
          sh(HOOD_HEM, 0.12),
          sh('M 352 664 C 424 652 576 652 648 664 L 656 782 L 344 782 Z', 0.07)
        ],
        light: [sh('M 396 386 C 464 416 536 416 604 386 L 608 540 C 538 508 462 508 392 540 Z', 0.04)],
        lines: [
          st('M 418 300 C 392 244 398 164 500 164 C 602 164 608 244 582 300', 4, 0.2),
          st(HOOD_NECK, 9, 0.2, 'butt'),
          st('M 352 664 C 424 652 576 652 648 664 L 656 782 L 344 782 Z', 4, 0.24),
          st('M 352 666 L 398 722', 4, 0.24), st(mir('M 352 666 L 398 722'), 4, 0.24),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        cord: [
          { d: 'M 456 312 C 446 358 444 400 452 444', w: 10 },
          { d: 'M 544 312 C 554 358 556 400 548 444', w: 10 }
        ],
        dots: [{ x: 452, y: 450, r: 8 }, { x: 548, y: 450, r: 8 }],
        print: { x: 356, y: 370, w: 288, h: 268 }
      },
      back: {
        body: [
          'M 370 424 C 288 344 312 162 500 162 C 688 162 712 344 630 424 Z',
          HOOD_BODY
        ],
        shade: [
          sh('M 424 308 C 402 246 406 168 500 168 C 594 168 598 246 576 308 C 560 332 532 344 500 344 C 468 344 440 332 424 308 Z', 0.1),
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12)
        ],
        light: [],
        lines: [
          
          st('M 500 168 L 500 300', 2.5, 0.12),
          st(HOOD_NECK, 7, 0.16, 'butt'),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        print: { x: 330, y: 380, w: 340, h: 390 }
      }
    }
  };

  const crew = {
    name: 'Crewneck', short: 'CREW', kind: 'top',
    views: {
      front: {
        body: [HOOD_BODY],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12),
          sh('M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302 L 592 316 C 570 356 538 372 500 372 C 462 372 430 356 408 316 Z', 0.12)
        ],
        light: [sh('M 396 400 C 464 430 536 430 604 400 L 608 560 C 538 528 462 528 392 560 Z', 0.04)],
        lines: [
          st(HOOD_NECK, 24, 0.26, 'butt'),
          st('M 408 296 C 428 340 464 360 500 360 C 536 360 572 340 592 296', 3, 0.14, 'butt'),
          st('M 286 286 L 424 308', 2.5, 0.12), st('M 714 286 L 576 308', 2.5, 0.12),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        print: { x: 350, y: 400, w: 300, h: 340 }
      },
      back: {
        body: [HOOD_BODY],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12)
        ],
        light: [],
        lines: [
          st('M 420 300 C 438 326 466 336 500 336 C 534 336 562 326 580 300', 24, 0.24, 'butt'),
          st('M 286 286 L 424 308', 2.5, 0.12), st('M 714 286 L 576 308', 2.5, 0.12),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        print: { x: 334, y: 376, w: 332, h: 392 }
      }
    }
  };

  /* ─────────────────────── SWEATPANTS ─────────────────────── */
  const SWEAT_BODY =
    'M 322 158 L 678 158 L 700 452 L 686 874 C 686 896 670 910 648 910 L 566 910 ' +
    'C 548 910 534 896 534 876 L 516 556 L 500 466 L 484 556 L 466 876 ' +
    'C 470 894 454 910 434 910 L 352 910 C 330 910 314 896 314 874 L 300 452 Z';
  const SWEAT_WAIST = 'M 314 152 L 686 152 L 690 220 L 310 220 Z';
  const SWEAT_CUFF_L = 'M 316 846 L 469 846 L 466 876 C 470 894 454 910 434 910 L 352 910 C 330 910 314 896 314 874 Z';
  const SWEAT_SIDE_L = 'M 314 220 L 300 452 L 314 874 C 314 896 330 910 352 910 L 368 910 C 348 760 340 560 348 220 Z';
  const SWEAT_INSEAM_SHADE = 'M 484 556 L 500 466 L 516 556 L 502 720 Z';

  const sweats = {
    name: 'Sweatpants', short: 'SWEATS', kind: 'bottom',
    views: {
      front: {
        body: [SWEAT_BODY],
        shade: [
          sh(SWEAT_WAIST, 0.12), sh(SWEAT_CUFF_L, 0.12), sh(mir(SWEAT_CUFF_L), 0.12),
          sh(SWEAT_SIDE_L), sh(mir(SWEAT_SIDE_L)), sh(SWEAT_INSEAM_SHADE, 0.1)
        ],
        light: [sh('M 372 260 C 400 420 396 640 384 840 L 430 840 C 438 640 436 420 416 260 Z', 0.04)],
        lines: [
          st('M 310 220 L 690 220', 3.5, 0.24),
          st('M 500 158 L 500 476', 2, 0.1),
          st('M 316 846 L 469 846', 3, 0.2), st(mir('M 316 846 L 469 846'), 3, 0.2),
          st('M 352 236 L 366 840', 2.5, 0.12), st(mir('M 352 236 L 366 840'), 2.5, 0.12)
        ],
        cord: [
          { d: 'M 476 222 C 466 262 452 284 430 300', w: 8 },
          { d: 'M 524 222 C 534 262 548 284 570 300', w: 8 }
        ],
        dots: [{ x: 428, y: 304, r: 7 }, { x: 572, y: 304, r: 7 }],
        print: { x: 336, y: 470, w: 148, h: 192 }
      },
      back: {
        body: [SWEAT_BODY],
        shade: [
          sh(SWEAT_WAIST, 0.12), sh(SWEAT_CUFF_L, 0.12), sh(mir(SWEAT_CUFF_L), 0.12),
          sh(SWEAT_SIDE_L), sh(mir(SWEAT_SIDE_L)), sh(SWEAT_INSEAM_SHADE, 0.12),
          sh('M 352 300 C 420 330 470 340 500 476 C 530 340 580 330 648 300 L 660 380 C 590 400 540 440 512 540 L 500 500 L 488 540 C 460 440 410 400 340 380 Z', 0.06)
        ],
        light: [],
        lines: [
          st('M 310 220 L 690 220', 3.5, 0.24),
          st('M 500 158 L 500 476', 2.5, 0.14),
          st('M 316 846 L 469 846', 3, 0.2), st(mir('M 316 846 L 469 846'), 3, 0.2),
          st('M 352 236 L 366 840', 2.5, 0.12), st(mir('M 352 236 L 366 840'), 2.5, 0.12),
          st('M 376 300 C 410 330 440 380 452 430', 2.5, 0.12), st(mir('M 376 300 C 410 330 440 380 452 430'), 2.5, 0.12)
        ],
        print: { x: 516, y: 470, w: 148, h: 192 }
      }
    }
  };

  /* ───────────────────────── JEANS ───────────────────────── */
  const JEAN_BODY =
    'M 328 176 L 672 176 L 690 470 L 672 900 C 672 918 660 928 642 928 L 572 928 ' +
    'C 558 928 546 916 546 898 L 524 556 L 500 470 L 476 556 L 454 898 ' +
    'C 456 916 444 928 428 928 L 358 928 C 340 928 328 918 328 900 L 310 470 Z';
  const JEAN_WAIST = 'M 324 170 L 676 170 L 680 240 L 320 240 Z';
  const JEAN_SIDE_L = 'M 328 240 L 310 470 L 328 900 C 328 918 340 928 358 928 L 372 928 C 354 760 344 560 352 240 Z';
  const JEAN_FADE_L = 'M 368 300 C 404 400 408 560 398 700 L 452 700 C 458 540 448 400 424 300 Z';
  const dash = (d, w) => ({ d: d, w: w || 2.6, dash: [11, 9] });

  const jeans = {
    name: 'Jeans', short: 'JEANS', kind: 'bottom', stitch: '#e7c479',
    views: {
      front: {
        body: [JEAN_BODY],
        shade: [
          sh(JEAN_WAIST, 0.1), sh(JEAN_SIDE_L, 0.09), sh(mir(JEAN_SIDE_L), 0.09),
          sh('M 476 556 L 500 470 L 524 556 L 506 720 Z', 0.1),
          sh('M 330 860 L 454 860 L 454 898 C 456 916 444 928 428 928 L 358 928 C 340 928 328 918 328 900 Z', 0.08),
          sh(mir('M 330 860 L 454 860 L 454 898 C 456 916 444 928 428 928 L 358 928 C 340 928 328 918 328 900 Z'), 0.08)
        ],
        light: [sh(JEAN_FADE_L, 0.09), sh(mir(JEAN_FADE_L), 0.09),
          sh('M 340 620 C 400 640 460 640 470 620 L 470 690 C 420 668 366 668 344 690 Z', 0.05),
          sh(mir('M 340 620 C 400 640 460 640 470 620 L 470 690 C 420 668 366 668 344 690 Z'), 0.05)],
        lines: [
          st('M 320 240 L 680 240', 3.5, 0.26),
          st('M 500 240 L 500 352', 2.5, 0.2),
          st('M 340 176 L 340 216', 7, 0.2), st('M 500 176 L 500 210', 7, 0.2), st(mir('M 340 176 L 340 216'), 7, 0.2)
        ],
        stitch: [
          dash('M 326 186 L 674 186'), dash('M 324 230 L 676 230'),
          dash('M 344 244 C 396 258 428 292 442 330'), dash(mir('M 344 244 C 396 258 428 292 442 330')),
          dash('M 520 246 C 528 300 520 340 500 356'),
          dash('M 488 556 L 462 890'), dash(mir('M 488 556 L 462 890')),
          dash('M 334 884 L 458 884'), dash(mir('M 334 884 L 458 884')),
          dash('M 556 250 C 578 258 590 268 598 280')
        ],
        dots: [{ x: 350, y: 250, r: 6, stitch: true }, { x: 650, y: 250, r: 6, stitch: true },
          { x: 444, y: 336, r: 5.5, stitch: true }, { x: 556, y: 336, r: 5.5, stitch: true }],
        print: { x: 338, y: 500, w: 140, h: 172 }
      },
      back: {
        body: [JEAN_BODY],
        shade: [
          sh(JEAN_WAIST, 0.1), sh(JEAN_SIDE_L, 0.09), sh(mir(JEAN_SIDE_L), 0.09),
          sh('M 476 556 L 500 470 L 524 556 L 506 720 Z', 0.12),
          sh('M 352 320 L 470 320 L 470 448 L 358 448 Z', 0.06), sh(mir('M 352 320 L 470 320 L 470 448 L 358 448 Z'), 0.06)
        ],
        light: [sh(JEAN_FADE_L, 0.07), sh(mir(JEAN_FADE_L), 0.07)],
        lines: [
          st('M 320 240 L 680 240', 3.5, 0.26),
          st('M 340 176 L 340 216', 7, 0.2), st('M 500 176 L 500 210', 7, 0.2), st(mir('M 340 176 L 340 216'), 7, 0.2),
          st('M 500 240 L 500 486', 2, 0.12)
        ],
        stitch: [
          dash('M 326 186 L 674 186'), dash('M 324 230 L 676 230'),
          dash('M 352 316 L 472 316 L 470 440 L 412 462 L 356 440 Z'), dash(mir('M 352 316 L 472 316 L 470 440 L 412 462 L 356 440 Z')),
          dash('M 356 334 L 468 334'), dash(mir('M 356 334 L 468 334')),
          dash('M 340 244 C 400 268 452 284 486 300'), dash(mir('M 340 244 C 400 268 452 284 486 300')),
          dash('M 488 556 L 462 890'), dash(mir('M 488 556 L 462 890')),
          dash('M 334 884 L 458 884'), dash(mir('M 334 884 L 458 884'))
        ],
        print: { x: 362, y: 336, w: 100, h: 96 }
      }
    }
  };

  /* ───────────────────────── SHORTS ───────────────────────── */
  const SHORT_BODY =
    'M 326 172 L 674 172 L 692 430 L 684 618 C 684 636 672 646 654 646 L 556 646 ' +
    'C 542 646 530 634 530 620 L 516 456 L 500 408 L 484 456 L 470 620 ' +
    'C 472 634 460 646 444 646 L 346 646 C 328 646 316 636 316 618 L 308 430 Z';
  const SHORT_SIDE_L = 'M 316 232 L 308 430 L 316 618 C 316 636 328 646 346 646 L 362 646 C 346 520 342 350 348 232 Z';

  const shorts = {
    name: 'Shorts', short: 'SHORTS', kind: 'bottom',
    views: {
      front: {
        body: [SHORT_BODY],
        shade: [
          sh('M 318 166 L 682 166 L 686 232 L 314 232 Z', 0.12),
          sh(SHORT_SIDE_L), sh(mir(SHORT_SIDE_L)),
          sh('M 484 456 L 500 408 L 516 456 L 504 560 Z', 0.1),
          sh('M 318 606 L 470 606 L 470 620 C 472 634 460 646 444 646 L 346 646 C 328 646 316 636 316 618 Z', 0.1),
          sh(mir('M 318 606 L 470 606 L 470 620 C 472 634 460 646 444 646 L 346 646 C 328 646 316 636 316 618 Z'), 0.1)
        ],
        light: [sh('M 374 264 C 396 360 394 480 386 588 L 428 588 C 434 480 432 360 416 264 Z', 0.04)],
        lines: [
          st('M 314 232 L 686 232', 3.5, 0.24),
          st('M 500 172 L 500 424', 2, 0.1),
          st('M 318 606 L 470 606', 3, 0.18), st(mir('M 318 606 L 470 606'), 3, 0.18)
        ],
        cord: [{ d: 'M 478 234 C 468 266 456 284 436 296', w: 8 }, { d: 'M 522 234 C 532 266 544 284 564 296', w: 8 }],
        dots: [{ x: 434, y: 300, r: 6.5 }, { x: 566, y: 300, r: 6.5 }],
        print: { x: 338, y: 450, w: 140, h: 140 }
      },
      back: {
        body: [SHORT_BODY],
        shade: [
          sh('M 318 166 L 682 166 L 686 232 L 314 232 Z', 0.12),
          sh(SHORT_SIDE_L), sh(mir(SHORT_SIDE_L)),
          sh('M 484 456 L 500 408 L 516 456 L 504 560 Z', 0.12),
          sh('M 356 300 L 468 300 L 468 396 L 360 396 Z', 0.07), sh(mir('M 356 300 L 468 300 L 468 396 L 360 396 Z'), 0.07),
          sh('M 318 606 L 470 606 L 470 620 C 472 634 460 646 444 646 L 346 646 C 328 646 316 636 316 618 Z', 0.1),
          sh(mir('M 318 606 L 470 606 L 470 620 C 472 634 460 646 444 646 L 346 646 C 328 646 316 636 316 618 Z'), 0.1)
        ],
        light: [],
        lines: [
          st('M 314 232 L 686 232', 3.5, 0.24),
          st('M 500 172 L 500 424', 2.5, 0.14),
          st('M 356 300 L 468 300 L 466 392 L 412 410 L 358 392 Z', 2.5, 0.16),
          st(mir('M 356 300 L 468 300 L 466 392 L 412 410 L 358 392 Z'), 2.5, 0.16),
          st('M 318 606 L 470 606', 3, 0.18), st(mir('M 318 606 L 470 606'), 3, 0.18)
        ],
        print: { x: 430, y: 450, w: 140, h: 140 }
      }
    }
  };

  /* ────────────────────────── CAP ────────────────────────── */
  const CAP_CROWN = 'M 206 470 C 196 302 328 178 500 178 C 672 178 804 302 794 470 C 700 494 600 502 500 502 C 400 502 300 494 206 470 Z';
  const CAP_BRIM = 'M 212 452 C 288 492 392 508 500 508 C 608 508 712 492 788 452 C 826 486 820 548 776 570 C 682 606 570 618 500 618 C 430 618 318 606 224 570 C 180 548 174 486 212 452 Z';

  const cap = {
    name: 'Cap', short: 'CAP', kind: 'head',
    views: {
      front: {
        body: [CAP_CROWN, CAP_BRIM],
        shade: [
          sh(CAP_BRIM, 0.2),
          sh('M 206 470 C 196 302 328 178 500 178 L 500 502 C 400 502 300 494 206 470 Z', 0.04),
          sh('M 212 452 C 288 492 392 508 500 508 C 608 508 712 492 788 452 C 792 470 790 484 784 496 C 706 532 604 546 500 546 C 396 546 294 532 216 496 C 210 484 208 470 212 452 Z', 0.12)
        ],
        light: [sh('M 396 206 C 330 246 286 320 280 420 L 330 434 C 336 336 372 262 440 196 Z', 0.06)],
        lines: [
          st('M 500 180 L 500 502', 2.5, 0.16),
          st('M 352 208 C 386 300 396 420 394 494', 2.5, 0.16),
          st(mir('M 352 208 C 386 300 396 420 394 494'), 2.5, 0.16),
          st('M 206 470 C 300 494 400 502 500 502 C 600 502 700 494 794 470', 3.5, 0.22)
        ],
        dots: [{ x: 500, y: 186, r: 17 }, { x: 430, y: 300, r: 7 }, { x: 570, y: 300, r: 7 }],
        print: { x: 388, y: 292, w: 224, h: 152 }
      },
      back: {
        body: [
          'M 206 470 C 196 302 328 178 500 178 C 672 178 804 302 794 470 C 700 494 600 502 500 502 C 400 502 300 494 206 470 Z',
          'M 214 466 C 214 466 300 492 500 492 C 700 492 786 466 786 466 C 792 492 792 520 786 542 C 700 566 620 572 500 572 C 380 572 300 566 214 542 C 208 520 208 492 214 466 Z'
        ],
        shade: [
          sh('M 214 466 C 214 466 300 492 500 492 C 700 492 786 466 786 466 C 792 492 792 520 786 542 C 700 566 620 572 500 572 C 380 572 300 566 214 542 C 208 520 208 492 214 466 Z', 0.14),
          sh('M 430 470 L 570 470 L 570 572 L 430 572 Z', 0.3)
        ],
        light: [],
        lines: [
          st('M 352 208 C 386 300 396 420 394 494', 2.5, 0.16),
          st(mir('M 352 208 C 386 300 396 420 394 494'), 2.5, 0.16),
          st('M 206 470 C 300 494 400 502 500 502 C 600 502 700 494 794 470', 3.5, 0.2),
          st('M 430 496 L 430 566', 3, 0.3), st('M 570 496 L 570 566', 3, 0.3)
        ],
        dots: [{ x: 500, y: 186, r: 17 }],
        print: { x: 406, y: 326, w: 188, h: 116 }
      }
    }
  };

  SD.GARMENTS = {
    tee: tee, hoodie: hoodie, crew: crew, sweats: sweats, jeans: jeans, shorts: shorts, cap: cap
  };
  SD.GARMENT_ORDER = ['tee', 'hoodie', 'crew', 'sweats', 'jeans', 'shorts', 'cap'];

  /* fabric palettes */
  SD.PALETTES = {
    top: ['#111214', '#f4f2ec', '#dcd6c8', '#8d8d8d', '#1f3a2c', '#1b2a4a', '#8e1f1f', '#5a3a26', '#c9b7e8', '#d6ff3f', '#f2a0c0', '#ff5a1f'],
    bottom: ['#2b4a72', '#7d9cc0', '#1a1a1c', '#e8e2d4', '#3f3f42', '#45624a', '#6b5136', '#9a9a9a', '#0f1a2e', '#c2b280', '#5c2b2b', '#d6ff3f'],
    head: ['#111214', '#f4f2ec', '#2b4a72', '#1f3a2c', '#8e1f1f', '#dcd6c8', '#8d8d8d', '#5a3a26', '#d6ff3f', '#ff5a1f', '#c9b7e8', '#3f3f42']
  };

  /** small svg preview for the picker */
  SD.garmentIcon = function (id, color) {
    const g = SD.GARMENTS[id], v = g.views.front;
    const fill = color || 'currentColor';
    let d = '';
    v.body.forEach((b) => { d += b + ' '; });
    return '<svg viewBox="80 60 840 900" aria-hidden="true"><path d="' + d +
      '" fill="' + fill + '" fill-opacity=".9" stroke="currentColor" stroke-opacity=".45" stroke-width="12"/></svg>';
  };
})(window.SD);
