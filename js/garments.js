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
        behind: 1,
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
          'M 336 400 C 300 318 330 176 500 176 C 670 176 700 318 664 400 Z',
          HOOD_BODY
        ],
        behind: 1,
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12)
        ],
        light: [],
        lines: [
          
          st('M 500 182 L 500 300', 2.5, 0.1),
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


  /* ───────────────── LONGSLEEVE (shares the sweat body) ───────────────── */
  const LS_CUFF_L = 'M 142 500 L 200 588';
  const longsleeve = {
    name: 'Longsleeve', short: 'L/S', kind: 'top',
    views: {
      front: {
        body: [HOOD_BODY],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh('M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302 L 592 316 C 570 356 538 372 500 372 C 462 372 430 356 408 316 Z', 0.12)
        ],
        light: [sh('M 396 400 C 464 430 536 430 604 400 L 608 600 C 538 566 462 566 392 600 Z', 0.035)],
        lines: [
          st(HOOD_NECK, 15, 0.3, 'butt'),
          st('M 410 296 C 430 338 464 358 500 358 C 536 358 570 338 590 296', 3, 0.15, 'butt'),
          st('M 286 286 L 424 308', 2.5, 0.12), st('M 714 286 L 576 308', 2.5, 0.12),
          st(LS_CUFF_L, 3, 0.2), st(mir(LS_CUFF_L), 3, 0.2),
          st('M 298 842 L 702 842', 3, 0.16)
        ],
        print: { x: 350, y: 400, w: 300, h: 360 }
      },
      back: {
        body: [HOOD_BODY],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09)
        ],
        light: [],
        lines: [
          st('M 420 300 C 438 326 466 336 500 336 C 534 336 562 326 580 300', 16, 0.28, 'butt'),
          st('M 286 286 L 424 308', 2.5, 0.12), st('M 714 286 L 576 308', 2.5, 0.12),
          st(LS_CUFF_L, 3, 0.2), st(mir(LS_CUFF_L), 3, 0.2),
          st('M 298 842 L 702 842', 3, 0.16)
        ],
        print: { x: 334, y: 380, w: 332, h: 400 }
      }
    }
  };

  /* ───────────────── ZIP HOODIE ───────────────── */
  const ZIP_POCKET_L = 'M 330 664 C 362 652 396 648 420 650 L 412 676 C 388 674 356 678 334 688 Z';
  const zip = {
    name: 'Zip Hoodie', short: 'ZIP', kind: 'top',
    views: {
      front: {
        body: ['M 362 436 C 278 342 302 158 500 158 C 698 158 722 342 638 436 Z', HOOD_BODY],
        behind: 1,
        shade: [
          sh('M 424 308 C 398 248 402 172 500 172 C 598 172 602 248 576 308 C 560 332 532 344 500 344 C 468 344 440 332 424 308 Z', 0.3),
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12),
          sh(ZIP_POCKET_L, 0.08), sh(mir(ZIP_POCKET_L), 0.08),
          sh('M 486 344 L 514 344 L 514 858 L 486 858 Z', 0.1)
        ],
        light: [],
        lines: [
          st('M 418 300 C 392 244 398 164 500 164 C 602 164 608 244 582 300', 4, 0.2),
          st(HOOD_NECK, 9, 0.2, 'butt'),
          st('M 500 344 L 500 858', 3, 0.3),
          st(ZIP_POCKET_L, 3, 0.22), st(mir(ZIP_POCKET_L), 3, 0.22),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        stitch: [dash('M 490 350 L 490 852', 2), dash('M 510 350 L 510 852', 2)],
        cord: [{ d: 'M 456 312 C 446 358 444 400 452 444', w: 10 }, { d: 'M 544 312 C 554 358 556 400 548 444', w: 10 }],
        dots: [{ x: 452, y: 450, r: 8 }, { x: 548, y: 450, r: 8 }, { x: 500, y: 368, r: 11 }],
        print: { x: 360, y: 380, w: 128, h: 190 }
      },
      back: {
        body: ['M 336 400 C 300 318 330 176 500 176 C 670 176 700 318 664 400 Z', HOOD_BODY],
        behind: 1,
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12)
        ],
        light: [],
        lines: [
          st('M 500 182 L 500 300', 2.5, 0.1),
          st(HOOD_NECK, 7, 0.16, 'butt'),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        print: { x: 330, y: 400, w: 340, h: 380 }
      }
    }
  };

  /* ───────────────── TRACK JACKET (accent stripes) ───────────────── */
  const TRACK_COLLAR = 'M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302 L 592 232 C 566 268 536 282 500 282 C 464 282 434 268 408 232 Z';
  const TRACK_STRIPE_L = 'M 246 316 L 276 336 L 168 574 L 134 556 Z';
  const track = {
    name: 'Track Jacket', short: 'TRACK', kind: 'top', accentDefault: '#e0180f',
    views: {
      front: {
        body: [HOOD_BODY, TRACK_COLLAR],
        accent: [TRACK_STRIPE_L, mir(TRACK_STRIPE_L)],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12),
          sh(TRACK_COLLAR, 0.1), sh('M 486 344 L 514 344 L 514 858 L 486 858 Z', 0.1)
        ],
        light: [],
        lines: [
          st('M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302', 3, 0.2, 'butt'),
          st('M 500 282 L 500 858', 3, 0.3),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        stitch: [dash('M 490 352 L 490 852', 2), dash('M 510 352 L 510 852', 2)],
        dots: [{ x: 500, y: 300, r: 11 }],
        print: { x: 362, y: 400, w: 126, h: 180 }
      },
      back: {
        body: [HOOD_BODY, TRACK_COLLAR],
        accent: [TRACK_STRIPE_L, mir(TRACK_STRIPE_L)],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12), sh(TRACK_COLLAR, 0.14)
        ],
        light: [],
        lines: [
          st('M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302', 3, 0.2, 'butt'),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        print: { x: 334, y: 400, w: 332, h: 380 }
      }
    }
  };

  /* ───────────────── VARSITY (accent sleeves + ribs) ───────────────── */
  const VAR_SLEEVE_L =
    'M 286 286 C 210 330 152 410 120 526 C 128 560 148 592 176 612' +
    ' C 218 570 260 516 298 470 C 292 400 288 340 286 286 Z';
  const VAR_RIB_COLLAR = 'M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302 L 590 250 C 564 286 536 300 500 300 C 464 300 436 286 410 250 Z';
  const varsity = {
    name: 'Varsity', short: 'VARSITY', kind: 'top', accentDefault: '#f4f2ec',
    views: {
      front: {
        body: [HOOD_BODY],
        accent: [VAR_SLEEVE_L, mir(VAR_SLEEVE_L), VAR_RIB_COLLAR, HOOD_HEM, HOOD_CUFF_L, mir(HOOD_CUFF_L)],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.07), sh(mir(HOOD_SLEEVE_SHADE_L), 0.07),
          sh(HOOD_HEM, 0.08), sh(VAR_RIB_COLLAR, 0.08),
          sh('M 486 350 L 514 350 L 514 858 L 486 858 Z', 0.08)
        ],
        light: [],
        lines: [
          st('M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302', 3, 0.2, 'butt'),
          st('M 500 350 L 500 858', 2.5, 0.22),
          st('M 298 470 C 292 400 288 340 286 286', 3, 0.18), st(mir('M 298 470 C 292 400 288 340 286 286'), 3, 0.18),
          st(HOOD_RIB_LINES, 2, 0.12), st(CUFF_RIB_L, 2, 0.14), st(mir(CUFF_RIB_L), 2, 0.14),
          st('M 296 796 L 704 796', 3.5, 0.22)
        ],
        dots: [{ x: 500, y: 420, r: 11 }, { x: 500, y: 520, r: 11 }, { x: 500, y: 620, r: 11 }, { x: 500, y: 720, r: 11 }],
        print: { x: 360, y: 396, w: 124, h: 172 }
      },
      back: {
        body: [HOOD_BODY],
        accent: [VAR_SLEEVE_L, mir(VAR_SLEEVE_L), VAR_RIB_COLLAR, HOOD_HEM, HOOD_CUFF_L, mir(HOOD_CUFF_L)],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.07), sh(mir(HOOD_SLEEVE_SHADE_L), 0.07),
          sh(HOOD_HEM, 0.08), sh(VAR_RIB_COLLAR, 0.1)
        ],
        light: [],
        lines: [
          st('M 418 302 C 436 336 466 350 500 350 C 534 350 564 336 582 302', 3, 0.2, 'butt'),
          st('M 298 470 C 292 400 288 340 286 286', 3, 0.18), st(mir('M 298 470 C 292 400 288 340 286 286'), 3, 0.18),
          st(HOOD_RIB_LINES, 2, 0.12), st(CUFF_RIB_L, 2, 0.14), st(mir(CUFF_RIB_L), 2, 0.14),
          st('M 296 796 L 704 796', 3.5, 0.22)
        ],
        print: { x: 336, y: 392, w: 328, h: 380 }
      }
    }
  };

  /* ───────────────── FOOTBALL JERSEY (raglan accent) ───────────────── */
  const JER_BODY = TEE_BODY('L 458 264 L 500 332 L 542 264 L 700 250');
  const TEE_SLEEVE_L = 'M 300 250 C 250 262 196 306 150 370 L 214 452 C 242 442 274 432 300 420 C 306 360 302 300 300 250 Z';
  const JER_RAGLAN_L = TEE_SLEEVE_L;
  const JER_COLLAR = 'M 458 264 L 500 332 L 542 264 L 562 272 L 500 366 L 438 272 Z';
  const jersey = {
    name: 'Jersey', short: 'JERSEY', kind: 'top', accentDefault: '#e0180f',
    views: {
      front: {
        body: [JER_BODY],
        accent: [JER_RAGLAN_L, mir(JER_RAGLAN_L), JER_COLLAR],
        shade: [
          sh(TEE_SIDE_L), sh(mir(TEE_SIDE_L)), sh(TEE_ARM_L, 0.08), sh(mir(TEE_ARM_L), 0.08),
          sh(JER_COLLAR, 0.08)
        ],
        light: [],
        lines: [
          st('M 458 264 L 500 332 L 542 264', 3, 0.2, 'butt'),
          st('M 300 420 C 306 360 302 300 300 250', 2.5, 0.18), st(mir('M 300 420 C 306 360 302 300 300 250'), 2.5, 0.18),
          
          st('M 302 832 L 698 832', 3, 0.16)
        ],
        print: { x: 356, y: 420, w: 288, h: 320 }
      },
      back: {
        body: [TEE_BODY(TEE_NECK_B)],
        accent: [TEE_SLEEVE_L, mir(TEE_SLEEVE_L)],
        shade: [sh(TEE_SIDE_L), sh(mir(TEE_SIDE_L)), sh(TEE_ARM_L, 0.08), sh(mir(TEE_ARM_L), 0.08)],
        light: [],
        lines: [
          st('M 414 264 C 432 290 462 300 500 300 C 538 300 568 290 586 264', 15, 0.26, 'butt'),
          st('M 300 420 C 306 360 302 300 300 250', 2.5, 0.18), st(mir('M 300 420 C 306 360 302 300 300 250'), 2.5, 0.18),
          
          st('M 302 832 L 698 832', 3, 0.16)
        ],
        print: { x: 348, y: 360, w: 304, h: 400 }
      }
    }
  };

  /* ───────────────── CARGO PANTS ───────────────── */
  const CARGO_POCKET_L = 'M 322 520 L 452 520 L 448 648 L 328 648 Z';
  const CARGO_FLAP_L = 'M 318 512 L 456 512 L 452 556 L 322 556 Z';
  const cargo = {
    name: 'Cargo Pants', short: 'CARGO', kind: 'bottom',
    views: {
      front: {
        body: [SWEAT_BODY],
        shade: [
          sh(SWEAT_WAIST, 0.12), sh(SWEAT_CUFF_L, 0.12), sh(mir(SWEAT_CUFF_L), 0.12),
          sh(SWEAT_SIDE_L), sh(mir(SWEAT_SIDE_L)), sh(SWEAT_INSEAM_SHADE, 0.1),
          sh(CARGO_POCKET_L, 0.08), sh(mir(CARGO_POCKET_L), 0.08),
          sh(CARGO_FLAP_L, 0.12), sh(mir(CARGO_FLAP_L), 0.12)
        ],
        light: [],
        lines: [
          st('M 310 220 L 690 220', 3.5, 0.24),
          st('M 500 158 L 500 466', 2, 0.1),
          st(CARGO_POCKET_L, 3, 0.24), st(mir(CARGO_POCKET_L), 3, 0.24),
          st(CARGO_FLAP_L, 3, 0.26), st(mir(CARGO_FLAP_L), 3, 0.26),
          st('M 316 846 L 469 846', 3, 0.2), st(mir('M 316 846 L 469 846'), 3, 0.2),
          st('M 352 236 L 366 840', 2.5, 0.12), st(mir('M 352 236 L 366 840'), 2.5, 0.12),
          st('M 336 276 C 372 292 396 316 408 344', 2.5, 0.16), st(mir('M 336 276 C 372 292 396 316 408 344'), 2.5, 0.16)
        ],
        dots: [{ x: 386, y: 556, r: 7 }, { x: 614, y: 556, r: 7 }],
        cord: [{ d: 'M 476 222 C 466 262 452 284 430 300', w: 8 }, { d: 'M 524 222 C 534 262 548 284 570 300', w: 8 }],
        print: { x: 348, y: 300, w: 120, h: 150 }
      },
      back: {
        body: [SWEAT_BODY],
        shade: [
          sh(SWEAT_WAIST, 0.12), sh(SWEAT_CUFF_L, 0.12), sh(mir(SWEAT_CUFF_L), 0.12),
          sh(SWEAT_SIDE_L), sh(mir(SWEAT_SIDE_L)), sh(SWEAT_INSEAM_SHADE, 0.12),
          sh('M 348 300 L 458 300 L 456 400 L 352 400 Z', 0.07), sh(mir('M 348 300 L 458 300 L 456 400 L 352 400 Z'), 0.07)
        ],
        light: [],
        lines: [
          st('M 310 220 L 690 220', 3.5, 0.24),
          st('M 500 158 L 500 466', 2.5, 0.14),
          st('M 348 300 L 458 300 L 456 396 L 404 414 L 350 396 Z', 2.5, 0.18),
          st(mir('M 348 300 L 458 300 L 456 396 L 404 414 L 350 396 Z'), 2.5, 0.18),
          st('M 316 846 L 469 846', 3, 0.2), st(mir('M 316 846 L 469 846'), 3, 0.2)
        ],
        print: { x: 530, y: 480, w: 130, h: 170 }
      }
    }
  };

  /* ───────────────── BEANIE ───────────────── */
  const BEANIE_DOME = 'M 262 566 C 262 330 352 216 500 216 C 648 216 738 330 738 566 Z';
  const BEANIE_CUFF = 'M 248 542 L 752 542 L 756 662 C 758 692 734 712 704 712 L 296 712 C 266 712 242 692 244 662 Z';
  const BEANIE_RIB = (function () {
    let d = '';
    for (let x = 262; x <= 738; x += 22) d += 'M ' + x + ' 548 L ' + x + ' 706 ';
    return d;
  })();
  const beanie = {
    name: 'Beanie', short: 'BEANIE', kind: 'head',
    views: {
      front: {
        body: [BEANIE_DOME, BEANIE_CUFF],
        shade: [sh(BEANIE_CUFF, 0.1), sh('M 262 566 C 262 330 352 216 500 216 L 500 566 Z', 0.04)],
        light: [sh('M 396 260 C 340 300 306 380 300 500 L 348 512 C 352 396 380 316 436 250 Z', 0.05)],
        lines: [st(BEANIE_RIB, 2, 0.1), st('M 248 548 L 752 548', 3.5, 0.2)],
        print: { x: 396, y: 572, w: 208, h: 104 }
      },
      back: {
        body: [BEANIE_DOME, BEANIE_CUFF],
        shade: [sh(BEANIE_CUFF, 0.1)],
        light: [],
        lines: [st(BEANIE_RIB, 2, 0.1), st('M 248 548 L 752 548', 3.5, 0.2), st('M 500 220 L 500 542', 2, 0.08)],
        print: { x: 400, y: 576, w: 200, h: 96 }
      }
    }
  };

  /* ───────────────── BUCKET HAT ───────────────── */
  const BUCKET_CROWN = 'M 302 438 C 302 292 382 212 500 212 C 618 212 698 292 698 438 Z';
  const BUCKET_BRIM = 'M 236 428 C 306 402 402 392 500 392 C 598 392 694 402 764 428 C 810 446 826 496 796 524 C 716 560 608 574 500 574 C 392 574 284 560 204 524 C 174 496 190 446 236 428 Z';
  const bucket = {
    name: 'Bucket Hat', short: 'BUCKET', kind: 'head',
    views: {
      front: {
        body: [BUCKET_CROWN, BUCKET_BRIM],
        shade: [
          sh(BUCKET_BRIM, 0.14),
          sh('M 236 428 C 306 402 402 392 500 392 C 598 392 694 402 764 428 C 768 444 766 456 760 468 C 688 442 600 432 500 432 C 400 432 312 442 240 468 C 234 456 232 444 236 428 Z', 0.12),
          sh('M 302 438 C 302 292 382 212 500 212 L 500 430 C 400 430 344 434 302 438 Z', 0.04)
        ],
        light: [],
        lines: [
          st('M 302 438 C 356 430 424 426 500 426 C 576 426 644 430 698 438', 3, 0.18),
          st('M 236 428 C 306 402 402 392 500 392 C 598 392 694 402 764 428', 3, 0.18),
          st('M 216 500 C 300 534 396 548 500 548 C 604 548 700 534 784 500', 2.5, 0.14)
        ],
        dots: [{ x: 350, y: 330, r: 7 }, { x: 650, y: 330, r: 7 }],
        print: { x: 404, y: 274, w: 192, h: 122 }
      },
      back: {
        body: [BUCKET_CROWN, BUCKET_BRIM],
        shade: [sh(BUCKET_BRIM, 0.14)],
        light: [],
        lines: [
          st('M 302 438 C 356 430 424 426 500 426 C 576 426 644 430 698 438', 3, 0.18),
          st('M 500 214 L 500 428', 2, 0.1)
        ],
        print: { x: 410, y: 280, w: 180, h: 112 }
      }
    }
  };

  /* ───────────────── TOTE ───────────────── */
  const TOTE_BAG = 'M 252 330 L 748 330 L 768 846 C 770 872 750 892 724 892 L 276 892 C 250 892 230 872 232 846 Z';
  const tote = {
    name: 'Tote', short: 'TOTE', kind: 'bag',
    views: {
      front: {
        body: [TOTE_BAG],
        shade: [
          sh('M 252 330 L 748 330 L 750 372 L 250 372 Z', 0.08),
          sh('M 252 330 L 300 330 L 286 892 L 276 892 C 250 892 230 872 232 846 Z', 0.07),
          sh(mir('M 252 330 L 300 330 L 286 892 L 276 892 C 250 892 230 872 232 846 Z'), 0.07)
        ],
        light: [],
        lines: [st('M 250 372 L 750 372', 2.5, 0.14)],
        cord: [{ d: 'M 330 330 C 326 176 474 176 470 330', w: 22 }, { d: 'M 530 330 C 526 176 674 176 670 330', w: 22 }],
        print: { x: 320, y: 430, w: 360, h: 340 }
      },
      back: {
        body: [TOTE_BAG],
        shade: [sh('M 252 330 L 748 330 L 750 372 L 250 372 Z', 0.08)],
        light: [],
        lines: [st('M 250 372 L 750 372', 2.5, 0.14)],
        cord: [{ d: 'M 330 330 C 326 176 474 176 470 330', w: 22 }, { d: 'M 530 330 C 526 176 674 176 670 330', w: 22 }],
        print: { x: 320, y: 430, w: 360, h: 340 }
      }
    }
  };


  /* ───────────────── COACH JACKET ───────────────── */
  const COACH_COLLAR_L = 'M 420 300 L 500 344 L 466 404 L 396 328 C 390 318 390 306 396 296 Z';
  const COACH_BAND = 'M 420 300 C 440 328 468 340 500 340 C 532 340 560 328 580 300 L 586 284 C 562 312 534 324 500 324 C 466 324 438 312 414 284 Z';
  const COACH_POCKET_L = 'M 322 636 C 356 624 392 620 418 622 L 408 652 C 382 650 348 654 326 664 Z';
  const coach = {
    name: 'Coach Jacket', short: 'COACH', kind: 'top',
    views: {
      front: {
        body: [HOOD_BODY, COACH_BAND, COACH_COLLAR_L, mir(COACH_COLLAR_L)],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12),
          sh(COACH_BAND, 0.14), sh(COACH_COLLAR_L, 0.05), sh(mir(COACH_COLLAR_L), 0.05),
          sh(COACH_POCKET_L, 0.08), sh(mir(COACH_POCKET_L), 0.08),
          sh('M 488 344 L 512 344 L 512 858 L 488 858 Z', 0.08)
        ],
        light: [],
        lines: [
          st('M 420 300 L 500 344 L 466 404 L 396 328', 3, 0.22, 'butt'),
          st(mir('M 420 300 L 500 344 L 466 404 L 396 328'), 3, 0.22, 'butt'),
          st('M 500 344 L 500 858', 2.5, 0.24),
          st(COACH_POCKET_L, 3, 0.22), st(mir(COACH_POCKET_L), 3, 0.22),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        dots: [{ x: 500, y: 430, r: 10 }, { x: 500, y: 530, r: 10 }, { x: 500, y: 630, r: 10 }, { x: 500, y: 730, r: 10 }],
        print: { x: 362, y: 404, w: 122, h: 180 }
      },
      back: {
        body: [HOOD_BODY, COACH_BAND],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(HOOD_CUFF_L, 0.12), sh(mir(HOOD_CUFF_L), 0.12), sh(HOOD_HEM, 0.12), sh(COACH_BAND, 0.16)
        ],
        light: [],
        lines: [
          st('M 420 300 C 440 328 468 340 500 340 C 532 340 560 328 580 300', 3, 0.2, 'butt'),
          st(HOOD_RIB_LINES, 2, 0.1), st(CUFF_RIB_L, 2, 0.12), st(mir(CUFF_RIB_L), 2, 0.12),
          st('M 296 796 L 704 796', 3.5, 0.2)
        ],
        print: { x: 334, y: 400, w: 332, h: 380 }
      }
    }
  };

  /* ───────────────── FLANNEL / WORK SHIRT ───────────────── */
  const SHIRT_COLLAR_L = 'M 416 296 L 496 348 L 452 414 L 386 330 C 378 318 380 304 390 292 Z';
  const SHIRT_POCKET_L = 'M 350 420 L 442 420 L 438 510 L 354 510 Z';
  const SHIRT_HEM = 'M 296 796 C 380 826 620 826 704 796 L 704 858 L 296 858 Z';
  const flannel = {
    name: 'Flannel Shirt', short: 'FLANNEL', kind: 'top',
    views: {
      front: {
        body: [HOOD_BODY, COACH_BAND, SHIRT_COLLAR_L, mir(SHIRT_COLLAR_L)],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(COACH_BAND, 0.14), sh(SHIRT_COLLAR_L, 0.05), sh(mir(SHIRT_COLLAR_L), 0.05),
          sh(SHIRT_POCKET_L, 0.06), sh(mir(SHIRT_POCKET_L), 0.06),
          sh('M 474 348 L 526 348 L 526 858 L 474 858 Z', 0.07)
        ],
        light: [],
        lines: [
          st('M 416 296 L 496 348 L 452 414 L 386 330', 3, 0.22, 'butt'),
          st(mir('M 416 296 L 496 348 L 452 414 L 386 330'), 3, 0.22, 'butt'),
          st('M 476 350 L 476 856', 2.5, 0.2), st('M 524 350 L 524 856', 2.5, 0.2),
          st(SHIRT_POCKET_L, 3, 0.2), st(mir(SHIRT_POCKET_L), 3, 0.2),
          st('M 350 440 L 442 440', 2.5, 0.16), st(mir('M 350 440 L 442 440'), 2.5, 0.16),
          st('M 140 566 L 196 652', 3, 0.18), st(mir('M 140 566 L 196 652'), 3, 0.18)
        ],
        dots: [{ x: 500, y: 400, r: 9 }, { x: 500, y: 500, r: 9 }, { x: 500, y: 600, r: 9 },
          { x: 500, y: 700, r: 9 }, { x: 500, y: 800, r: 9 }],
        print: { x: 356, y: 540, w: 118, h: 200 }
      },
      back: {
        body: [HOOD_BODY, COACH_BAND],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(COACH_BAND, 0.16),
          sh('M 296 400 C 380 430 620 430 704 400 L 704 424 C 620 454 380 454 296 424 Z', 0.06)
        ],
        light: [],
        lines: [
          st('M 420 300 C 440 328 468 340 500 340 C 532 340 560 328 580 300', 3, 0.2, 'butt'),
          st('M 296 424 C 380 454 620 454 704 424', 2.5, 0.14),
          st('M 140 566 L 196 652', 3, 0.18), st(mir('M 140 566 L 196 652'), 3, 0.18)
        ],
        print: { x: 334, y: 440, w: 332, h: 340 }
      }
    }
  };

  /* ───────────────── PUFFER ───────────────── */
  const PUFF_BODY =
    'M 300 296 C 364 272 432 260 500 260 C 568 260 636 272 700 296' +
    ' C 800 336 868 428 892 542 C 882 584 856 614 822 630' +
    ' C 778 598 738 540 710 486' +
    ' C 718 620 720 742 714 868 C 636 890 364 890 286 868' +
    ' C 280 742 282 620 290 486 C 262 540 222 598 178 630' +
    ' C 144 614 118 584 108 542 C 132 428 200 336 300 296 Z';
  const PUFF_QUILT = (function () {
    let d = '';
    [356, 430, 504, 578, 652, 726, 800].forEach(function (y) {
      d += 'M 292 ' + y + ' C 400 ' + (y + 14) + ' 600 ' + (y + 14) + ' 708 ' + y + ' ';
    });
    return d;
  })();
  const PUFF_QUILT_BANDS = [356, 430, 504, 578, 652, 726, 800].map(function (y) {
    return { d: 'M 292 ' + y + ' C 400 ' + (y + 14) + ' 600 ' + (y + 14) + ' 708 ' + y +
      ' L 708 ' + (y + 13) + ' C 600 ' + (y + 27) + ' 400 ' + (y + 27) + ' 292 ' + (y + 13) + ' Z', a: 0.07 };
  });
  const PUFF_SLEEVE_QUILT_L = (function () {
    let d = '';
    for (let i = 0; i < 4; i++) {
      const t = 0.22 + i * 0.19;
      d += 'M ' + SD.round(290 - 150 * t, 1) + ' ' + SD.round(420 + 190 * t, 1) +
        ' L ' + SD.round(150 - 40 * t, 1) + ' ' + SD.round(360 + 230 * t, 1) + ' ';
    }
    return d;
  })();
  const puffer = {
    name: 'Puffer', short: 'PUFFER', kind: 'top',
    views: {
      front: {
        body: [PUFF_BODY, 'M 428 306 C 440 332 468 344 500 344 C 532 344 560 332 572 306 L 576 262 C 572 252 562 246 550 246 L 450 246 C 438 246 428 252 424 262 Z'],
        shade: PUFF_QUILT_BANDS.concat([
          sh('M 290 486 L 286 868 C 316 878 340 882 356 884 C 342 750 340 600 348 470 Z', 0.07),
          sh(mir('M 290 486 L 286 868 C 316 878 340 882 356 884 C 342 750 340 600 348 470 Z'), 0.07),
          sh('M 428 306 C 440 332 468 344 500 344 C 532 344 560 332 572 306 L 576 262 C 572 252 562 246 550 246 L 450 246 C 438 246 428 252 424 262 Z', 0.12),
          sh('M 486 350 L 514 350 L 514 880 L 486 880 Z', 0.1)
        ]),
        light: [sh('M 340 330 C 300 380 276 450 268 520 L 316 540 C 326 466 350 402 386 356 Z', 0.05)],
        lines: [
          st(PUFF_QUILT, 2.5, 0.14),
          st(PUFF_SLEEVE_QUILT_L, 2.5, 0.12), st(mir(PUFF_SLEEVE_QUILT_L), 2.5, 0.12),
          st('M 500 250 L 500 880', 3, 0.26),
          st('M 428 306 C 440 332 468 344 500 344 C 532 344 560 332 572 306', 3, 0.18, 'butt')
        ],
        stitch: [dash('M 490 262 L 490 874', 2), dash('M 510 262 L 510 874', 2)],
        dots: [{ x: 500, y: 300, r: 11 }],
        print: { x: 368, y: 380, w: 112, h: 180 }
      },
      back: {
        body: [PUFF_BODY, 'M 428 306 C 440 332 468 344 500 344 C 532 344 560 332 572 306 L 576 262 C 572 252 562 246 550 246 L 450 246 C 438 246 428 252 424 262 Z'],
        shade: PUFF_QUILT_BANDS.concat([
          sh('M 290 486 L 286 868 C 316 878 340 882 356 884 C 342 750 340 600 348 470 Z', 0.07),
          sh(mir('M 290 486 L 286 868 C 316 878 340 882 356 884 C 342 750 340 600 348 470 Z'), 0.07),
          sh('M 428 306 C 440 332 468 344 500 344 C 532 344 560 332 572 306 L 576 262 C 572 252 562 246 550 246 L 450 246 C 438 246 428 252 424 262 Z', 0.14)
        ]),
        light: [],
        lines: [
          st(PUFF_QUILT, 2.5, 0.14),
          st(PUFF_SLEEVE_QUILT_L, 2.5, 0.12), st(mir(PUFF_SLEEVE_QUILT_L), 2.5, 0.12),
          st('M 428 306 C 440 332 468 344 500 344 C 532 344 560 332 572 306', 3, 0.18, 'butt')
        ],
        print: { x: 330, y: 386, w: 340, h: 380 }
      }
    }
  };


  /* ───────────────── DENIM / TRUCKER JACKET ───────────────── */
  const DENIM_YOKE = 'M 296 430 C 380 462 620 462 704 430 L 704 452 C 620 484 380 484 296 452 Z';
  const DENIM_POCKET_L = 'M 356 470 L 448 470 L 444 566 L 360 566 Z';
  const DENIM_FLAP_L = 'M 352 462 L 452 462 L 448 500 L 356 500 Z';
  const DENIM_WAIST = 'M 296 790 C 380 812 620 812 704 790 L 704 858 L 296 858 Z';
  const denim = {
    name: 'Denim Jacket', short: 'DENIM', kind: 'top', stitch: '#e7c479',
    views: {
      front: {
        body: [HOOD_BODY, COACH_BAND, SHIRT_COLLAR_L, mir(SHIRT_COLLAR_L)],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(COACH_BAND, 0.14), sh(DENIM_WAIST, 0.1),
          sh(DENIM_POCKET_L, 0.05), sh(mir(DENIM_POCKET_L), 0.05),
          sh(DENIM_FLAP_L, 0.1), sh(mir(DENIM_FLAP_L), 0.1),
          sh('M 474 348 L 526 348 L 526 858 L 474 858 Z', 0.07)
        ],
        light: [
          sh('M 372 500 C 392 580 392 680 376 780 L 434 780 C 444 670 442 570 424 496 Z', 0.07),
          sh(mir('M 372 500 C 392 580 392 680 376 780 L 434 780 C 444 670 442 570 424 496 Z'), 0.07)
        ],
        lines: [
          st('M 416 296 L 496 348 L 452 414 L 386 330', 3, 0.22, 'butt'),
          st(mir('M 416 296 L 496 348 L 452 414 L 386 330'), 3, 0.22, 'butt'),
          st('M 296 790 C 380 812 620 812 704 790', 3, 0.2)
        ],
        stitch: [
          dash('M 296 440 C 380 472 620 472 704 440'),
          dash('M 478 352 L 478 852'), dash('M 522 352 L 522 852'),
          dash(DENIM_POCKET_L), dash(mir(DENIM_POCKET_L)),
          dash(DENIM_FLAP_L), dash(mir(DENIM_FLAP_L)),
          dash('M 296 796 C 380 818 620 818 704 796'),
          dash('M 140 566 L 196 652'), dash(mir('M 140 566 L 196 652'))
        ],
        dots: [{ x: 500, y: 400, r: 9, stitch: true }, { x: 500, y: 520, r: 9, stitch: true },
          { x: 500, y: 640, r: 9, stitch: true }, { x: 500, y: 760, r: 9, stitch: true },
          { x: 402, y: 494, r: 7, stitch: true }, { x: 598, y: 494, r: 7, stitch: true }],
        print: { x: 356, y: 600, w: 118, h: 180 }
      },
      back: {
        body: [HOOD_BODY, COACH_BAND],
        shade: [
          sh(HOOD_SIDE_L), sh(mir(HOOD_SIDE_L)),
          sh(HOOD_SLEEVE_SHADE_L, 0.09), sh(mir(HOOD_SLEEVE_SHADE_L), 0.09),
          sh(COACH_BAND, 0.16), sh(DENIM_WAIST, 0.1), sh(DENIM_YOKE, 0.06)
        ],
        light: [],
        lines: [
          st('M 420 300 C 440 328 468 340 500 340 C 532 340 560 328 580 300', 3, 0.2, 'butt'),
          st('M 296 790 C 380 812 620 812 704 790', 3, 0.2)
        ],
        stitch: [
          dash('M 296 440 C 380 472 620 472 704 440'),
          dash('M 296 796 C 380 818 620 818 704 796'),
          dash('M 140 566 L 196 652'), dash(mir('M 140 566 L 196 652'))
        ],
        print: { x: 334, y: 480, w: 332, h: 290 }
      }
    }
  };

  /* ───────────────── MESH SHORTS ───────────────── */
  const MESH_BODY =
    'M 320 172 L 680 172 L 700 440 L 690 686 C 690 706 676 718 656 718 L 552 718 ' +
    'C 534 718 522 706 522 688 L 512 470 L 500 414 L 488 470 L 478 688 ' +
    'C 478 706 466 718 448 718 L 344 718 C 324 718 310 706 310 686 L 300 440 Z';
  const MESH_STRIPE_L = 'M 322 236 L 348 236 L 362 700 L 334 700 Z';
  const MESH_SIDE_L = 'M 310 236 L 300 440 L 310 686 C 310 706 324 718 344 718 L 360 718 C 344 560 340 380 346 236 Z';
  const mesh = {
    name: 'Mesh Shorts', short: 'MESH', kind: 'bottom', accentDefault: '#f4f2ec',
    views: {
      front: {
        body: [MESH_BODY],
        accent: [MESH_STRIPE_L, mir(MESH_STRIPE_L)],
        shade: [
          sh('M 314 166 L 686 166 L 690 236 L 310 236 Z', 0.12),
          sh(MESH_SIDE_L), sh(mir(MESH_SIDE_L)),
          sh('M 488 470 L 500 414 L 512 470 L 502 580 Z', 0.1)
        ],
        light: [sh('M 376 280 C 396 400 394 540 388 676 L 428 676 C 434 540 432 400 418 280 Z', 0.04)],
        lines: [
          st('M 310 236 L 690 236', 3.5, 0.24),
          st('M 500 172 L 500 414', 2, 0.1),
          st('M 312 676 L 478 676', 2.5, 0.16), st(mir('M 312 676 L 478 676'), 2.5, 0.16)
        ],
        cord: [{ d: 'M 478 238 C 468 270 456 288 436 300', w: 8 }, { d: 'M 522 238 C 532 270 544 288 564 300', w: 8 }],
        print: { x: 372, y: 470, w: 116, h: 150 }
      },
      back: {
        body: [MESH_BODY],
        accent: [MESH_STRIPE_L, mir(MESH_STRIPE_L)],
        shade: [
          sh('M 314 166 L 686 166 L 690 236 L 310 236 Z', 0.12),
          sh(MESH_SIDE_L), sh(mir(MESH_SIDE_L)),
          sh('M 488 470 L 500 414 L 512 470 L 502 580 Z', 0.12)
        ],
        light: [],
        lines: [
          st('M 310 236 L 690 236', 3.5, 0.24),
          st('M 500 172 L 500 414', 2.5, 0.14),
          st('M 312 676 L 478 676', 2.5, 0.16), st(mir('M 312 676 L 478 676'), 2.5, 0.16)
        ],
        print: { x: 512, y: 470, w: 116, h: 150 }
      }
    }
  };

  /* ───────────────── SOCKS (a pair) ───────────────── */
  const SOCK_L =
    'M 352 180 L 476 180 L 476 610 C 476 660 452 698 404 704 L 300 704 ' +
    'C 262 704 242 682 242 652 C 242 622 264 604 296 600 C 332 596 348 578 352 542 Z';
  const SOCK_CUFF_L = 'M 352 180 L 476 180 L 476 268 L 352 268 Z';
  const SOCK_RIB_L = (function () {
    let d = '';
    for (let x = 360; x <= 470; x += 14) d += 'M ' + x + ' 186 L ' + x + ' 262 ';
    return d;
  })();
  const SOCK_STRIPE_A_L = 'M 352 282 L 476 282 L 476 314 L 352 314 Z';
  const SOCK_STRIPE_B_L = 'M 352 330 L 476 330 L 476 362 L 352 362 Z';
  const socks = {
    name: 'Socks', short: 'SOCKS', kind: 'bag', accentDefault: '#e0180f',
    views: {
      front: {
        body: [SOCK_L, mir(SOCK_L)],
        accent: [SOCK_STRIPE_A_L, mir(SOCK_STRIPE_A_L), SOCK_STRIPE_B_L, mir(SOCK_STRIPE_B_L)],
        shade: [
          sh(SOCK_CUFF_L, 0.08), sh(mir(SOCK_CUFF_L), 0.08),
          sh('M 352 542 C 348 578 332 596 296 600 C 264 604 242 622 242 652 C 242 682 262 704 300 704 L 404 704 C 452 698 476 660 476 610 L 476 660 C 452 700 420 716 380 716 L 296 716 C 256 714 232 690 232 656 C 232 620 258 596 292 590 C 322 586 340 570 344 540 Z', 0.12),
          sh(mir('M 352 542 C 348 578 332 596 296 600 C 264 604 242 622 242 652 C 242 682 262 704 300 704 L 404 704 C 452 698 476 660 476 610 L 476 660 C 452 700 420 716 380 716 L 296 716 C 256 714 232 690 232 656 C 232 620 258 596 292 590 C 322 586 340 570 344 540 Z'), 0.12)
        ],
        light: [],
        lines: [
          st(SOCK_RIB_L, 2, 0.12), st(mir(SOCK_RIB_L), 2, 0.12),
          st('M 352 268 L 476 268', 3, 0.2), st(mir('M 352 268 L 476 268'), 3, 0.2),
          st('M 352 542 C 348 578 332 596 296 600', 2.5, 0.14),
          st(mir('M 352 542 C 348 578 332 596 296 600'), 2.5, 0.14)
        ],
        print: { x: 364, y: 384, w: 100, h: 130 }
      },
      back: {
        body: [SOCK_L, mir(SOCK_L)],
        accent: [SOCK_STRIPE_A_L, mir(SOCK_STRIPE_A_L), SOCK_STRIPE_B_L, mir(SOCK_STRIPE_B_L)],
        shade: [sh(SOCK_CUFF_L, 0.08), sh(mir(SOCK_CUFF_L), 0.08)],
        light: [],
        lines: [
          st(SOCK_RIB_L, 2, 0.12), st(mir(SOCK_RIB_L), 2, 0.12),
          st('M 352 268 L 476 268', 3, 0.2), st(mir('M 352 268 L 476 268'), 3, 0.2)
        ],
        print: { x: 536, y: 384, w: 100, h: 130 }
      }
    }
  };

  SD.GARMENTS = {
    tee: tee, longsleeve: longsleeve, jersey: jersey, hoodie: hoodie, zip: zip, crew: crew,
    track: track, coach: coach, denim: denim, varsity: varsity, puffer: puffer, flannel: flannel,
    sweats: sweats, jeans: jeans, cargo: cargo, shorts: shorts, mesh: mesh,
    cap: cap, beanie: beanie, bucket: bucket, tote: tote, socks: socks
  };
  SD.GARMENT_ORDER = ['tee', 'longsleeve', 'jersey', 'hoodie', 'zip', 'crew', 'track', 'coach',
    'denim', 'varsity', 'puffer', 'flannel', 'sweats', 'jeans', 'cargo', 'shorts', 'mesh',
    'cap', 'beanie', 'bucket', 'tote', 'socks'];

  /* fabric palettes */
  /* roughly how many centimetres the 1000-unit design space spans, per garment —
     used to quote real print sizes on the tech pack */
  SD.GARMENT_CM = {
    tee: 130, longsleeve: 128, jersey: 130, hoodie: 132, zip: 132, crew: 132, track: 132,
    coach: 134, denim: 132, varsity: 134, puffer: 138, flannel: 132, sweats: 112, jeans: 108,
    cargo: 112, shorts: 108, mesh: 108, cap: 34, beanie: 38, bucket: 42, tote: 58, socks: 46
  };

  SD.PALETTES = {
    top: ['#111214', '#f4f2ec', '#dcd6c8', '#8d8d8d', '#1f3a2c', '#1b2a4a', '#8e1f1f', '#5a3a26', '#c9b7e8', '#d6ff3f', '#f2a0c0', '#ff5a1f'],
    bottom: ['#2b4a72', '#7d9cc0', '#1a1a1c', '#e8e2d4', '#3f3f42', '#45624a', '#6b5136', '#9a9a9a', '#0f1a2e', '#c2b280', '#5c2b2b', '#d6ff3f'],
    head: ['#111214', '#f4f2ec', '#2b4a72', '#1f3a2c', '#8e1f1f', '#dcd6c8', '#8d8d8d', '#5a3a26', '#d6ff3f', '#ff5a1f', '#c9b7e8', '#3f3f42'],
    bag: ['#dcd6c8', '#111214', '#f4f2ec', '#1f3a2c', '#8e1f1f', '#2b4a72', '#8d8d8d', '#5a3a26', '#d6ff3f', '#ff5a1f', '#c9b7e8', '#3f3f42']
  };

  /* ── print placements ──────────────────────────────────────────────
     Real production placements. Every view gets a zone list; the first is
     the default. Sleeve/hem/neck boxes differ per silhouette family. */
  const SLEEVE_BOX = {
    short: { x: 182, y: 320, w: 96, h: 78 },
    long: { x: 160, y: 440, w: 104, h: 92 }
  };
  const HEM_BOX = { short: { x: 386, y: 756, w: 228, h: 58 }, long: { x: 386, y: 706, w: 228, h: 62 } };
  const NECK_BOX = { short: { x: 428, y: 306, w: 144, h: 50 }, long: { x: 428, y: 348, w: 144, h: 50 } };
  const SHORT_SLEEVED = { tee: 1, jersey: 1 };

  function buildZones(id, view, v) {
    const g = SD.GARMENTS[id], r = v.print, k = g.kind, out = [];
    const Z = function (zid, name, x, y, w, h) {
      out.push({ id: zid, name: name, x: SD.round(x, 1), y: SD.round(y, 1), w: SD.round(w, 1), h: SD.round(h, 1) });
    };
    if (k === 'top') {
      const fam = SHORT_SLEEVED[id] ? 'short' : 'long';
      if (view === 'front') {
        Z('main', 'FULL FRONT', r.x, r.y, r.w, r.h);
        if (r.w > 200) {
          Z('chest', 'CHEST', r.x + r.w * 0.12, r.y + r.h * 0.03, r.w * 0.76, r.h * 0.34);
          Z('small', 'SMALL CHEST', r.x + r.w * 0.06, r.y + r.h * 0.04, r.w * 0.32, r.h * 0.15);
        } else {
          Z('small', 'SMALL CHEST', r.x + r.w * 0.06, r.y + r.h * 0.04, r.w * 0.8, r.h * 0.34);
        }
      } else {
        Z('main', 'FULL BACK', r.x, r.y, r.w, r.h);
        Z('upper', 'UPPER BACK', r.x + r.w * 0.1, r.y + r.h * 0.02, r.w * 0.8, r.h * 0.36);
        Z('neck', 'BACK NECK', NECK_BOX[fam].x, NECK_BOX[fam].y, NECK_BOX[fam].w, NECK_BOX[fam].h);
      }
      const sb = SLEEVE_BOX[fam], hb = HEM_BOX[fam];
      Z('sleeveL', 'SLEEVE L', sb.x, sb.y, sb.w, sb.h);
      Z('sleeveR', 'SLEEVE R', 1000 - sb.x - sb.w, sb.y, sb.w, sb.h);
      Z('hem', 'HEM', hb.x, hb.y, hb.w, hb.h);
    } else if (k === 'bottom') {
      Z('main', view === 'front' ? 'THIGH' : 'SEAT', r.x, r.y, r.w, r.h);
      if (view === 'front') {
        Z('hip', 'HIP', 336, 262, 130, 120);
        Z('legR', 'LEG R', 534, 470, 130, 180);
      } else {
        Z('legL', 'LEG L', 336, 480, 130, 170);
      }
      Z('cuff', 'CUFF', 342, 700, 116, 96);
    } else if (k === 'head') {
      Z('main', view === 'front' ? 'FRONT PANEL' : 'BACK PANEL', r.x, r.y, r.w, r.h);
      if (id === 'cap' && view === 'front') Z('side', 'SIDE PANEL', 250, 320, 110, 90);
      if (id === 'bucket') Z('brim', 'BRIM', 400, 452, 200, 74);
    } else {
      Z('main', 'MAIN PANEL', r.x, r.y, r.w, r.h);
      Z('small', 'SMALL HIT', r.x + r.w * 0.34, r.y + r.h * 0.06, r.w * 0.32, r.h * 0.2);
    }
    return out;
  }

  SD.GARMENT_ORDER.forEach(function (id) {
    ['front', 'back'].forEach(function (view) {
      const v = SD.GARMENTS[id].views[view];
      v.zones = buildZones(id, view, v);
    });
  });

  /** the contrast colour in play: an explicit pick, else the garment's own
      default — but only when it reads against the fabric */
  SD.accentFor = function (state) {
    if (state.accentColor) return state.accentColor;
    const def = SD.GARMENTS[state.garment].accentDefault;
    if (def && Math.abs(SD.lum(def) - SD.lum(state.color)) > 0.22) return def;
    return SD.isDark(state.color) ? '#f4f2ec' : '#141416';
  };

  /** rect for a placement id, falling back to the default zone */
  SD.zoneRect = function (garment, view, zoneId) {
    const zs = SD.GARMENTS[garment].views[view].zones;
    for (let i = 0; i < zs.length; i++) if (zs[i].id === zoneId) return zs[i];
    return zs[0];
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
