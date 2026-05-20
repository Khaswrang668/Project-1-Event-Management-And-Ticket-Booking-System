export const getHTMLtemplate = (ticket,booking,user,event)=>{
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Event Certificate</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1122px;
    height: 794px;
    background: #0b0b0f;
    font-family: 'Jost', sans-serif;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cert {
    width: 1080px;
    height: 760px;
    background: #faf8f3;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* Geometric corner decorations */
  .corner {
    position: absolute;
    width: 110px;
    height: 110px;
  }
  .corner svg { display: block; }
  .corner-tl { top: 20px; left: 20px; }
  .corner-tr { top: 20px; right: 20px; transform: scaleX(-1); }
  .corner-bl { bottom: 20px; left: 20px; transform: scaleY(-1); }
  .corner-br { bottom: 20px; right: 20px; transform: scale(-1,-1); }

  /* Outer border frame */
  .frame-outer {
    position: absolute;
    inset: 16px;
    border: 1.5px solid #c9a96e;
    pointer-events: none;
  }
  .frame-inner {
    position: absolute;
    inset: 22px;
    border: 0.5px solid rgba(180,145,80,0.35);
    pointer-events: none;
  }

  /* Background pattern – subtle diamond grid */
  .bg-pattern {
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(45deg, rgba(180,145,80,0.04) 0px, rgba(180,145,80,0.04) 1px, transparent 1px, transparent 28px),
      repeating-linear-gradient(-45deg, rgba(180,145,80,0.04) 0px, rgba(180,145,80,0.04) 1px, transparent 1px, transparent 28px);
    pointer-events: none;
  }

  /* Center ink blot / watermark crest */
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 340px;
    height: 340px;
    opacity: 0.045;
    pointer-events: none;
  }

  /* Horizontal gold rule lines */
  .rule {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 780px;
    margin: 0 auto;
  }
  .rule-line { flex: 1; height: 0.5px; background: #c9a96e; }
  .rule-diamond {
    width: 6px; height: 6px;
    background: #c9a96e;
    transform: rotate(45deg);
    flex-shrink: 0;
  }

  /* Typography */
  .header-label {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    font-size: 11px;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: #c9a96e;
    margin-bottom: 6px;
  }

  .cert-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: 52px;
    letter-spacing: 2px;
    color: #1a1714;
    line-height: 1;
    margin-bottom: 2px;
  }
  .cert-title em {
    font-style: italic;
    font-weight: 300;
  }

  .cert-subtitle {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    font-size: 11px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #7a6e5f;
    margin-top: 4px;
    margin-bottom: 18px;
  }

  .presented-to {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #9a8e7e;
    margin-top: 14px;
    margin-bottom: 4px;
  }

  .participant-name {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 42px;
    color: #1a1714;
    letter-spacing: 1px;
    margin-bottom: 2px;
    line-height: 1.1;
  }

  .event-pretext {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #9a8e7e;
    margin-top: 14px;
    margin-bottom: 2px;
  }

  .event-name {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 22px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #2d2720;
    margin-bottom: 2px;
  }

  .event-date {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    font-size: 12px;
    letter-spacing: 2px;
    color: #8a7e6e;
  }

  /* Bottom info row */
  .info-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 780px;
    margin-top: 18px;
    gap: 20px;
  }

  .info-block {
    text-align: center;
    flex: 1;
  }
  .info-label {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    font-size: 9px;
    letter-spacing: 3.5px;
    text-transform: uppercase;
    color: #b0a494;
    margin-bottom: 4px;
  }
  .info-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px;
    color: #3a3028;
    letter-spacing: 0.5px;
  }

  /* QR code block */
  .qr-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .qr-box {
    width: 58px;
    height: 58px;
    background: white;
    border: 1px solid #d4c8b4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: #aaa;
    padding: 4px;
  }
  .qr-token {
    font-family: 'Jost', sans-serif;
    font-size: 8px;
    letter-spacing: 1px;
    color: #b0a494;
    font-weight: 300;
    max-width: 100px;
    word-break: break-all;
    text-align: center;
  }

  /* Vertical divider */
  .info-divider {
    width: 0.5px;
    background: rgba(180,145,80,0.3);
    align-self: stretch;
    flex-shrink: 0;
  }

  /* Checkin badge */
  .checkin-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: 'Jost', sans-serif;
    font-weight: 400;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 5px 12px;
    border: 0.5px solid #c9a96e;
    color: #8a6c2e;
    background: rgba(201,169,110,0.07);
  }
</style>
</head>
<body>
<div class="cert">
  <div class="bg-pattern"></div>
  <div class="frame-outer"></div>
  <div class="frame-inner"></div>

  <!-- Watermark crest -->
  <svg class="watermark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="#8a6c2e" stroke-width="2"/>
    <polygon points="100,25 178,63 178,137 100,175 22,137 22,63" fill="none" stroke="#8a6c2e" stroke-width="1"/>
    <circle cx="100" cy="100" r="42" fill="none" stroke="#8a6c2e" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="52" fill="none" stroke="#8a6c2e" stroke-width="0.5"/>
    <line x1="100" y1="58" x2="100" y2="142" stroke="#8a6c2e" stroke-width="1"/>
    <line x1="58" y1="100" x2="142" y2="100" stroke="#8a6c2e" stroke-width="1"/>
    <line x1="70" y1="70" x2="130" y2="130" stroke="#8a6c2e" stroke-width="0.7"/>
    <line x1="130" y1="70" x2="70" y2="130" stroke="#8a6c2e" stroke-width="0.7"/>
    <polygon points="100,68 108,92 133,92 113,107 120,131 100,116 80,131 87,107 67,92 92,92" fill="#8a6c2e"/>
  </svg>

  <!-- Corner decorations -->
  <div class="corner corner-tl">
    <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path d="M8 8 L8 55" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M8 8 L55 8" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M14 14 L14 48 L48 14 Z" stroke="#c9a96e" stroke-width="0.5" fill="rgba(201,169,110,0.04)"/>
      <circle cx="8" cy="8" r="2.5" fill="#c9a96e"/>
      <rect x="28" y="5" width="6" height="6" transform="rotate(45 31 8)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
      <rect x="5" y="28" width="6" height="6" transform="rotate(45 8 31)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
      <path d="M14 26 Q20 20 26 14" stroke="#c9a96e" stroke-width="0.5" opacity="0.5"/>
      <path d="M14 38 Q26 26 38 14" stroke="#c9a96e" stroke-width="0.5" opacity="0.3"/>
    </svg>
  </div>
  <div class="corner corner-tr">
    <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path d="M8 8 L8 55" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M8 8 L55 8" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M14 14 L14 48 L48 14 Z" stroke="#c9a96e" stroke-width="0.5" fill="rgba(201,169,110,0.04)"/>
      <circle cx="8" cy="8" r="2.5" fill="#c9a96e"/>
      <rect x="28" y="5" width="6" height="6" transform="rotate(45 31 8)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
      <rect x="5" y="28" width="6" height="6" transform="rotate(45 8 31)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
      <path d="M14 26 Q20 20 26 14" stroke="#c9a96e" stroke-width="0.5" opacity="0.5"/>
      <path d="M14 38 Q26 26 38 14" stroke="#c9a96e" stroke-width="0.5" opacity="0.3"/>
    </svg>
  </div>
  <div class="corner corner-bl">
    <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path d="M8 8 L8 55" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M8 8 L55 8" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M14 14 L14 48 L48 14 Z" stroke="#c9a96e" stroke-width="0.5" fill="rgba(201,169,110,0.04)"/>
      <circle cx="8" cy="8" r="2.5" fill="#c9a96e"/>
      <rect x="28" y="5" width="6" height="6" transform="rotate(45 31 8)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
      <rect x="5" y="28" width="6" height="6" transform="rotate(45 8 31)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
    </svg>
  </div>
  <div class="corner corner-br">
    <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path d="M8 8 L8 55" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M8 8 L55 8" stroke="#c9a96e" stroke-width="1.2"/>
      <path d="M14 14 L14 48 L48 14 Z" stroke="#c9a96e" stroke-width="0.5" fill="rgba(201,169,110,0.04)"/>
      <circle cx="8" cy="8" r="2.5" fill="#c9a96e"/>
      <rect x="28" y="5" width="6" height="6" transform="rotate(45 31 8)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
      <rect x="5" y="28" width="6" height="6" transform="rotate(45 8 31)" fill="none" stroke="#c9a96e" stroke-width="0.7"/>
    </svg>
  </div>

  <!-- Main content -->
  <div style="position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; width:100%; gap:0;">

    <div class="header-label">Certificate of Attendance</div>

    <div class="rule" style="margin-bottom:12px;">
      <div class="rule-line"></div>
      <div class="rule-diamond"></div>
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 30,8 16,14 2,8" stroke="#c9a96e" stroke-width="0.8" fill="none"/>
      </svg>
      <div class="rule-diamond"></div>
      <div class="rule-line"></div>
    </div>

    <div class="cert-title"><em>Certificate</em> of Attendance</div>
    <div class="cert-subtitle">Official Recognition of Participation</div>

    <div class="rule" style="margin-bottom:0px; margin-top:4px;">
      <div class="rule-line"></div>
      <div class="rule-diamond"></div>
      <div class="rule-line"></div>
    </div>

    <div class="presented-to">This certificate is proudly presented to</div>

    <div class="participant-name" id="participantName">${booking.participantName}</div>

    <div class="event-pretext">For attending</div>
    <div class="event-name" id="eventName">${event.title}</div>
    <div class="event-date" id="eventDate">${event.startTime} – ${event.endTime} · ${event.venue}</div>

    <div class="rule" style="margin-top:16px; margin-bottom:14px;">
      <div class="rule-line"></div>
      <div class="rule-diamond"></div>
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
        <circle cx="12" cy="6" r="4" stroke="#c9a96e" stroke-width="0.8"/>
        <line x1="0" y1="6" x2="7" y2="6" stroke="#c9a96e" stroke-width="0.5"/>
        <line x1="17" y1="6" x2="24" y2="6" stroke="#c9a96e" stroke-width="0.5"/>
      </svg>
      <div class="rule-diamond"></div>
      <div class="rule-line"></div>
    </div>

    <!-- Bottom info row -->
    <div class="info-row">
      <!-- Booking ID -->
      <div class="info-block">
        <div class="info-label">Booking Reference</div>
        <div class="info-value" id="bookingId">${booking._id}</div>
      </div>

      <div class="info-divider"></div>

      <!-- Ticket count -->
      <div class="info-block">
        <div class="info-label">Tickets</div>
        <div class="info-value" id="ticketCount">${booking.ticketCount} Seats</div>
      </div>

      <div class="info-divider"></div>

      <!-- QR Code placeholder -->
      <div class="info-block qr-block">
        <div class="info-label">Scan to Verify</div>
        <div class="qr-box" id="qrPlaceholder">
          <!-- QR image or canvas injected here -->
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#2d2720">
            <!-- Minimal QR placeholder pattern -->
            <rect x="2" y="2" width="18" height="18" rx="1" fill="none" stroke="#2d2720" stroke-width="1.5"/>
            <rect x="6" y="6" width="10" height="10" rx="0.5" fill="#2d2720"/>
            <rect x="28" y="2" width="18" height="18" rx="1" fill="none" stroke="#2d2720" stroke-width="1.5"/>
            <rect x="32" y="6" width="10" height="10" rx="0.5" fill="#2d2720"/>
            <rect x="2" y="28" width="18" height="18" rx="1" fill="none" stroke="#2d2720" stroke-width="1.5"/>
            <rect x="6" y="32" width="10" height="10" rx="0.5" fill="#2d2720"/>
            <rect x="28" y="28" width="4" height="4" fill="#2d2720"/>
            <rect x="34" y="28" width="4" height="4" fill="#2d2720"/>
            <rect x="40" y="28" width="6" height="4" fill="#2d2720"/>
            <rect x="28" y="34" width="6" height="4" fill="#2d2720"/>
            <rect x="36" y="34" width="4" height="4" fill="#2d2720"/>
            <rect x="42" y="34" width="4" height="4" fill="#2d2720"/>
            <rect x="28" y="40" width="4" height="6" fill="#2d2720"/>
            <rect x="34" y="42" width="4" height="4" fill="#2d2720"/>
            <rect x="40" y="40" width="6" height="6" fill="#2d2720"/>
          </svg>
        </div>
        <div class="qr-token" id="qrToken">TKT-X7K2-9QRP</div>
      </div>

      <div class="info-divider"></div>

      <!-- Check-in status -->
      <div class="info-block">
        <div class="info-label">Status</div>
        <div id="checkinStatus" class="checkin-badge">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="#c9a96e" stroke-width="0.8"/>
            <path d="M3 5 L4.5 6.5 L7 3.5" stroke="#8a6c2e" stroke-width="1" stroke-linecap="round"/>
          </svg>
          Checked In
        </div>
        <div class="info-value" style="font-size:11px; margin-top:5px; color:#9a8e7e;" id="checkinTime">${ticket.isCheckedInAt}/div>
      </div>

      <div class="info-divider"></div>

      <!-- Issued date -->
      <div class="info-block">
        <div class="info-label">Issued On</div>
        <div class="info-value" id="issuedDate">${Date.now()}</div>
      </div>
    </div>

  </div>
</div>
</body>
</html>`
}