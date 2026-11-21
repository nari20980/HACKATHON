/* global $ */
'use strict';

$(function () {
  if (!$.fn || !$.fn.draggable || !$.fn.droppable) {
    console.error('jQuery UI failed to load. Check your jQuery and jQuery UI script tags.');
    return;
  }

  const $piecesGrid = $('#piecesGrid');
  const $slotsGrid = $('#slotsGrid');
  const $placedCount = $('#placedCount');
  const $winBanner = $('#winBanner');
  const $winDetail = $('#winDetail');

  let moves = 0;
  let placed = 0;

  function totalSlots() {
    return $slotsGrid.find('.puzzle-slot').length;
  }

  function updateProgress() {
    $placedCount.text(`${placed} / ${totalSlots()}`);
  }

  function showWinMessage() {
    $winDetail.text(`All ${totalSlots()} pieces snapped into their matching slots in ${moves} moves.`);
    $winBanner.removeClass('hidden');
  }

  function clearPieceDragStyles($piece) {
    $piece.removeClass('ui-draggable ui-draggable-handle ui-draggable-dragging');
    $piece.css({
      position: '',
      top: '',
      left: '',
      right: '',
      bottom: '',
      width: '',
      height: '',
      zIndex: ''
    });
  }

  function initDragAndDrop() {
    $('.puzzle-piece').not('.piece-locked').each(function () {
      const $piece = $(this);
      if ($piece.data('uiDraggable')) {
        $piece.draggable('destroy');
      }

      $piece.draggable({
        revert: function (dropped) {
          if (!dropped) {
            $(this).data('uiDraggable').originalPosition = { top: 0, left: 0 };
            return true;
          }
          return false;
        },
        revertDuration: 160,
        scroll: false,
        zIndex: 100,
        start() {
          moves += 1;
        }
      });
    });

    $('.puzzle-slot').each(function () {
      const $slot = $(this);
      if ($slot.data('uiDroppable')) {
        $slot.droppable('destroy');
      }

      const slotId = String($slot.data('slot'));
      $slot.droppable({
        accept: `.puzzle-piece[data-piece="${slotId}"]`,
        hoverClass: 'slot-hover',
        tolerance: 'pointer',
        drop(_event, ui) {
          const $piece = ui.draggable;
          if ($slot.hasClass('slot-filled') || $piece.hasClass('piece-locked')) {
            return;
          }

          if ($piece.data('uiDraggable')) {
            $piece.draggable('destroy');
          }

          clearPieceDragStyles($piece);
          $piece
            .appendTo($slot)
            .addClass('piece-locked')
            .attr('aria-disabled', 'true');

          $slot.removeClass('slot-hover').addClass('slot-filled');
          placed += 1;
          updateProgress();

          if (placed >= totalSlots()) {
            showWinMessage();
          }
        }
      });
    });
  }

  function shuffleTray() {
    const $pieces = $piecesGrid.children('.puzzle-piece').get();
    for (let i = $pieces.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = $pieces[i];
      $pieces[i] = $pieces[j];
      $pieces[j] = temp;
    }
    $piecesGrid.append($pieces);
  }

  function resetBoard() {
    moves = 0;
    placed = 0;
    $winBanner.addClass('hidden');

    $('.puzzle-piece').each(function () {
      const $p = $(this);
      if ($p.data('uiDraggable')) {
        $p.draggable('destroy');
      }
    });

    const $allPieces = $('.puzzle-piece').detach();
    $allPieces.each(function () {
      const $p = $(this);
      $p.removeClass('piece-locked').removeAttr('aria-disabled');
      clearPieceDragStyles($p);
    });

    $('.puzzle-slot').each(function () {
      const $s = $(this);
      if ($s.data('uiDroppable')) {
        $s.droppable('destroy');
      }
      $s.removeClass('slot-filled slot-hover');
    });

    $piecesGrid.append($allPieces);
    shuffleTray();
    updateProgress();
    initDragAndDrop();
  }

  $('#btnShuffle, #btnPlayAgain').on('click', resetBoard);

  resetBoard();
});