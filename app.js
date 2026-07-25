/* ─── RECOVO AI — app.js (Complete, Backend-Connected) ─── */
const API = '/api';

// ── Utilities ──
const $ = id => document.getElementById(id);
const showToast = (msg, dur = 2800) => {
  const t = $('toast'); t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
};

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    return await res.json();
  } catch {
    return null; // Backend offline — fall back to demo mode
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MULTI-LANGUAGE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

const TRANSLATIONS = {
  en: {
    // Home
    welcome_heading:      'How are you feeling today?',
    welcome_sub:          "Tap the button below and tell me how you're doing.",
    start_checkin:        'Start Daily Check-in',
    last_checkin:         'Last check-in',
    recovery_progress:    'Recovery\nProgress',
    medication_reminder:  'Medication\nReminder',
    emergency_help:       'Emergency\nHelp',
    // Nav
    nav_home:             'Home',
    nav_progress:         'Progress',
    nav_meds:             'Meds',
    nav_profile:          'Profile',
    // Check-in
    checkin_title:        'Daily Check-in',
    listening:            'Listening… speak now',
    listen_init:          'Listening…',
    done_rerecord:        'Done! Tap to re-record.',
    type_below:           'Type your symptoms below',
    transcript_ph:        'Your words will appear here…',
    edit_manually:        '✏️ Edit manually',
    analyze_btn:          'Analyze Symptoms',
    analyzing:            'Analyzing…',
    voice_fallback:       '🎤 Voice not supported in this browser. Please type below.',
    mic_denied:           '🎤 Microphone access denied. Please allow mic and try again.',
    no_speech:            '🔇 No speech detected. Tap mic and speak clearly.',
    net_error:            '🌐 Network error. Check your connection.',
    // Results
    result_title:         'Your Results',
    risk_level_label:     'Risk Level',
    risk_low:             'Low',
    risk_medium:          'Medium',
    risk_high:            'High',
    ai_confidence:        'AI Confidence',
    uncertainty_msg:      "⚠️ We're not fully confident. Please answer a few more questions.",
    why_result:           'Why this result?',
    what_do:              'What should you do?',
    answer_followup:      'Answer Follow-up Questions',
    done:                 'Done ✓',
    // Follow-up
    followup_title:       'A Few More Questions',
    question_of:          'Question {n} of {total}',
    ans_yes:              'Yes',
    ans_no:               'No',
    ans_unsure:           'Not Sure',
    voice_reply:          '🎙️ Reply by voice',
    // Recovery
    recovery_title:       'Recovery Progress',
    recovery_day:         'Day {n} of your recovery journey',
    pain_trend:           'Pain Level Trend',
    risk_history:         'Risk Level History',
    recent_alerts:        'Recent Alerts',
    no_alerts:            '✅ No alerts — keep up the great work!',
    // Meds
    meds_title:           'Medications',
    meds_sub:             "Today's schedule — stay on track 💊",
    add_medicine:         'Add Medicine',
    no_meds:              '💊 No medicines yet. Tap "Add" to get started.',
    med_taken:            'Taken',
    med_pending:          'Pending',
    med_doctor_note:      'Always consult your doctor before changing medication.',
    choose_icon:          'Choose Icon',
    med_name_label:       'Medicine Name',
    dose_label:           'Dose & Instructions',
    time_label:           'Time',
    med_name_ph:          'e.g. Paracetamol',
    dose_ph:              'e.g. 500mg — 1 tablet after food',
    med_name_error:       'Please enter the medicine name.',
    save_med:             '💊 Add Medicine',
    saving:               'Saving…',
    // Emergency
    emerg_heading:        'Seek Medical Help\nImmediately',
    emerg_sub:            'Your symptoms suggest you need urgent attention. Do not wait.',
    call_doctor:          '📞 Call Doctor',
    notify_caregiver:     '🔔 Notify Caregiver',
    im_okay:              "← I'm okay, go back",
    nearest_hospital:     '🏥 Nearest:',
    km_away:              'km away',
    // Profile
    profile_title:        'Profile & Settings',
    patient_info:         'Patient Information',
    full_name:            'Full Name',
    age:                  'Age',
    surgery_type:         'Surgery Type',
    surgery_date:         'Surgery Date',
    lang_settings:        'Language',
    app_language:         'App Language',
    voice_language:       'Voice Language',
    notifications:        'Notifications',
    med_reminders:        'Medication Reminders',
    daily_checkin:        'Daily Check-in',
    caregiver_alerts:     'Caregiver Alerts',
    doctor_contact:       'Doctor Contact',
    doctor_name:          "Doctor's Name",
    doctor_phone:         "Doctor's Phone",
    caregiver_contact:    'Caregiver Contact',
    caregiver_name:       'Name',
    caregiver_phone:      'Phone',
    save_changes:         'Save Changes',
    // Toasts
    toast_checkin_saved:  '✅ Check-in saved!',
    toast_high_risk:      '🚨 High risk detected! Please seek help.',
    toast_medium_risk:    '⚠️ Monitor your symptoms closely.',
    toast_low_risk:       "✅ You're doing well!",
    toast_updating:       '⏳ Updating analysis…',
    toast_caregiver:      '🔔 Caregiver notified!',
    toast_profile_saved:  '✅ Profile saved!',
    // Risk messages
    msg_low:              "You're doing well! Keep resting and stay hydrated.",
    msg_medium:           'Some symptoms need attention. Monitor closely today.',
    msg_high:             'Your symptoms need urgent medical attention. Please seek help now.',
    // Status bar
    status_you_well:      "You're doing well",
    status_monitor:       'Keep monitoring',
    status_seek_help:     'Seek medical help',
    status_low_risk:      'Low Risk',
    status_medium_risk:   'Medium Risk',
    status_high_risk:     'High Risk',
  },

  hi: {
    welcome_heading:      'आज आप कैसा महसूस कर रहे हैं?',
    welcome_sub:          'नीचे बटन दबाएँ और मुझे बताएँ।',
    start_checkin:        'दैनिक चेक-इन शुरू करें',
    last_checkin:         'अंतिम चेक-इन',
    recovery_progress:    'रिकवरी\nप्रगति',
    medication_reminder:  'दवा\nरिमाइंडर',
    emergency_help:       'आपातकालीन\nसहायता',
    nav_home:             'होम',
    nav_progress:         'प्रगति',
    nav_meds:             'दवाएँ',
    nav_profile:          'प्रोफ़ाइल',
    checkin_title:        'दैनिक चेक-इन',
    listening:            'सुन रहा हूँ… बोलें',
    listen_init:          'सुन रहा हूँ…',
    done_rerecord:        'हो गया! दोबारा रिकॉर्ड करने के लिए दबाएँ।',
    type_below:           'नीचे लक्षण टाइप करें',
    transcript_ph:        'आपके शब्द यहाँ दिखेंगे…',
    edit_manually:        '✏️ मैन्युअल रूप से संपादित करें',
    analyze_btn:          'लक्षण विश्लेषण करें',
    analyzing:            'विश्लेषण हो रहा है…',
    voice_fallback:       '🎤 इस ब्राउज़र में वॉइस समर्थित नहीं। कृपया नीचे टाइप करें।',
    mic_denied:           '🎤 माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया माइक अनुमति दें।',
    no_speech:            '🔇 कोई आवाज़ नहीं मिली। माइक दबाएँ और स्पष्ट बोलें।',
    net_error:            '🌐 नेटवर्क त्रुटि। कनेक्शन जाँचें।',
    result_title:         'आपके परिणाम',
    risk_level_label:     'जोखिम स्तर',
    risk_low:             'कम',
    risk_medium:          'मध्यम',
    risk_high:            'अधिक',
    ai_confidence:        'AI विश्वास',
    uncertainty_msg:      '⚠️ हम पूरी तरह आश्वस्त नहीं हैं। कृपया कुछ और सवालों के उत्तर दें।',
    why_result:           'यह परिणाम क्यों?',
    what_do:              'आपको क्या करना चाहिए?',
    answer_followup:      'अनुवर्ती प्रश्नों के उत्तर दें',
    done:                 'पूर्ण ✓',
    followup_title:       'कुछ और प्रश्न',
    question_of:          'प्रश्न {n} का {total}',
    ans_yes:              'हाँ',
    ans_no:               'नहीं',
    ans_unsure:           'निश्चित नहीं',
    voice_reply:          '🎙️ आवाज़ से उत्तर दें',
    recovery_title:       'रिकवरी प्रगति',
    recovery_day:         'रिकवरी यात्रा का दिन {n}',
    pain_trend:           'दर्द स्तर प्रवृत्ति',
    risk_history:         'जोखिम स्तर इतिहास',
    recent_alerts:        'हाल की अलर्ट',
    no_alerts:            '✅ कोई अलर्ट नहीं — बहुत बढ़िया!',
    meds_title:           'दवाएँ',
    meds_sub:             'आज का शेड्यूल — समय पर लें 💊',
    add_medicine:         'दवा जोड़ें',
    no_meds:              '💊 अभी कोई दवा नहीं। "जोड़ें" दबाएँ।',
    med_taken:            'ली गई',
    med_pending:          'बाकी',
    med_doctor_note:      'दवा बदलने से पहले अपने डॉक्टर से सलाह लें।',
    choose_icon:          'आइकन चुनें',
    med_name_label:       'दवा का नाम',
    dose_label:           'खुराक और निर्देश',
    time_label:           'समय',
    med_name_ph:          'जैसे Paracetamol',
    dose_ph:              'जैसे 500mg — भोजन के बाद 1 गोली',
    med_name_error:       'कृपया दवा का नाम दर्ज करें।',
    save_med:             '💊 दवा जोड़ें',
    saving:               'सहेजा जा रहा है…',
    emerg_heading:        'तुरंत चिकित्सा सहायता लें',
    emerg_sub:            'आपके लक्षण तत्काल ध्यान की आवश्यकता दर्शाते हैं।',
    call_doctor:          '📞 डॉक्टर को कॉल करें',
    notify_caregiver:     '🔔 देखभालकर्ता को सूचित करें',
    im_okay:              '← मैं ठीक हूँ, वापस जाएँ',
    nearest_hospital:     '🏥 निकटतम:',
    km_away:              'किमी दूर',
    profile_title:        'प्रोफ़ाइल और सेटिंग',
    patient_info:         'रोगी जानकारी',
    full_name:            'पूरा नाम',
    age:                  'आयु',
    surgery_type:         'सर्जरी का प्रकार',
    surgery_date:         'सर्जरी की तारीख',
    lang_settings:        'भाषा',
    app_language:         'ऐप भाषा',
    voice_language:       'वॉइस भाषा',
    notifications:        'सूचनाएँ',
    med_reminders:        'दवा रिमाइंडर',
    daily_checkin:        'दैनिक चेक-इन',
    caregiver_alerts:     'देखभालकर्ता अलर्ट',
    doctor_contact:       'डॉक्टर संपर्क',
    doctor_name:          'डॉक्टर का नाम',
    doctor_phone:         'डॉक्टर का फ़ोन',
    caregiver_contact:    'देखभालकर्ता संपर्क',
    caregiver_name:       'नाम',
    caregiver_phone:      'फ़ोन',
    save_changes:         'परिवर्तन सहेजें',
    toast_checkin_saved:  '✅ चेक-इन सहेजा गया!',
    toast_high_risk:      '🚨 उच्च जोखिम! कृपया तुरंत सहायता लें।',
    toast_medium_risk:    '⚠️ अपने लक्षणों पर ध्यान दें।',
    toast_low_risk:       '✅ आप ठीक कर रहे हैं!',
    toast_updating:       '⏳ विश्लेषण अपडेट हो रहा है…',
    toast_caregiver:      '🔔 देखभालकर्ता को सूचित किया गया!',
    toast_profile_saved:  '✅ प्रोफ़ाइल सहेजी गई!',
    msg_low:              'आप ठीक हैं! आराम करें और पानी पिएँ।',
    msg_medium:           'कुछ लक्षणों पर ध्यान दें। आज सावधान रहें।',
    msg_high:             'आपके लक्षणों को तुरंत चिकित्सा की जरूरत है।',
    status_you_well:      'आप ठीक हैं',
    status_monitor:       'निगरानी करते रहें',
    status_seek_help:     'चिकित्सा सहायता लें',
    status_low_risk:      'कम जोखिम',
    status_medium_risk:   'मध्यम जोखिम',
    status_high_risk:     'अधिक जोखिम',
  },

  ta: {
    welcome_heading:      'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
    welcome_sub:          'கீழே உள்ள பொத்தானை அழுத்தி என்னிடம் சொல்லுங்கள்.',
    start_checkin:        'தினசரி செக்-இன் தொடங்கு',
    last_checkin:         'கடைசி செக்-இன்',
    recovery_progress:    'குணமடைதல்\nமுன்னேற்றம்',
    medication_reminder:  'மருந்து\nநினைவூட்டல்',
    emergency_help:       'அவசர\nஉதவி',
    nav_home:             'முகப்பு',
    nav_progress:         'முன்னேற்றம்',
    nav_meds:             'மருந்துகள்',
    nav_profile:          'சுயவிவரம்',
    checkin_title:        'தினசரி செக்-இன்',
    listening:            'கேட்கிறேன்… பேசுங்கள்',
    listen_init:          'கேட்கிறேன்…',
    done_rerecord:        'முடிந்தது! மீண்டும் பதிவு செய்ய தட்டவும்.',
    type_below:           'கீழே அறிகுறிகளை தட்டச்சு செய்யுங்கள்',
    transcript_ph:        'உங்கள் வார்த்தைகள் இங்கே தோன்றும்…',
    edit_manually:        '✏️ கைமுறையாக திருத்து',
    analyze_btn:          'அறிகுறிகளை பகுப்பாய்வு செய்',
    analyzing:            'பகுப்பாய்வு செய்கிறது…',
    voice_fallback:       '🎤 இந்த உலாவியில் குரல் ஆதரிக்கப்படவில்லை. கீழே தட்டச்சு செய்யுங்கள்.',
    mic_denied:           '🎤 மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது.',
    no_speech:            '🔇 பேச்சு கண்டறியப்படவில்லை. தெளிவாக பேசுங்கள்.',
    net_error:            '🌐 நெட்வொர்க் பிழை. இணைப்பை சரிபார்க்கவும்.',
    result_title:         'உங்கள் முடிவுகள்',
    risk_level_label:     'ஆபத்து நிலை',
    risk_low:             'குறைவு',
    risk_medium:          'நடுத்தரம்',
    risk_high:            'அதிகம்',
    ai_confidence:        'AI நம்பகத்தன்மை',
    uncertainty_msg:      '⚠️ நாங்கள் முழுமையாக உறுதியாக இல்லை. மேலும் சில கேள்விகளுக்கு பதில் சொல்லுங்கள்.',
    why_result:           'இந்த முடிவு ஏன்?',
    what_do:              'நீங்கள் என்ன செய்ய வேண்டும்?',
    answer_followup:      'தொடர் கேள்விகளுக்கு பதில் சொல்',
    done:                 'முடிந்தது ✓',
    followup_title:       'சில கேள்விகள்',
    question_of:          'கேள்வி {n} இல் {total}',
    ans_yes:              'ஆம்',
    ans_no:               'இல்லை',
    ans_unsure:           'உறுதியாக தெரியவில்லை',
    voice_reply:          '🎙️ குரலில் பதில் சொல்',
    recovery_title:       'குணமடைதல் முன்னேற்றம்',
    recovery_day:         'குணமடைதல் பயணத்தின் நாள் {n}',
    pain_trend:           'வலி நிலை போக்கு',
    risk_history:         'ஆபத்து நிலை வரலாறு',
    recent_alerts:        'சமீபத்திய எச்சரிக்கைகள்',
    no_alerts:            '✅ எச்சரிக்கைகள் இல்லை — தொடர்ந்து சிறப்பாக செய்யுங்கள்!',
    meds_title:           'மருந்துகள்',
    meds_sub:             'இன்றைய அட்டவணை — தவறாமல் எடுங்கள் 💊',
    add_medicine:         'மருந்து சேர்',
    no_meds:              '💊 இன்னும் மருந்துகள் இல்லை. "சேர்" என்பதை தட்டவும்.',
    med_taken:            'எடுக்கப்பட்டது',
    med_pending:          'நிலுவையில்',
    med_doctor_note:      'மருந்தை மாற்றுவதற்கு முன் உங்கள் மருத்துவரை கலந்தாலோசியுங்கள்.',
    choose_icon:          'ஐகான் தேர்ந்தெடு',
    med_name_label:       'மருந்தின் பெயர்',
    dose_label:           'மோதளவு & வழிமுறைகள்',
    time_label:           'நேரம்',
    med_name_ph:          'எ.கா. Paracetamol',
    dose_ph:              'எ.கா. 500mg — உணவுக்கு பின் 1 மாத்திரை',
    med_name_error:       'மருந்தின் பெயரை உள்ளிடுங்கள்.',
    save_med:             '💊 மருந்து சேர்',
    saving:               'சேமிக்கிறது…',
    emerg_heading:        'உடனடியாக மருத்துவ உதவி பெறுங்கள்',
    emerg_sub:            'உங்கள் அறிகுறிகள் அவசர கவனிப்பு தேவை என்பதை குறிக்கின்றன.',
    call_doctor:          '📞 மருத்துவரை அழை',
    notify_caregiver:     '🔔 பராமரிப்பாளருக்கு தெரிவி',
    im_okay:              '← நான் சரியாக இருக்கிறேன், திரும்பு',
    nearest_hospital:     '🏥 அருகிலுள்ளது:',
    km_away:              'கி.மீ தொலைவு',
    profile_title:        'சுயவிவரம் & அமைப்புகள்',
    patient_info:         'நோயாளி தகவல்',
    full_name:            'முழு பெயர்',
    age:                  'வயது',
    surgery_type:         'அறுவை சிகிச்சை வகை',
    surgery_date:         'அறுவை சிகிச்சை தேதி',
    lang_settings:        'மொழி',
    app_language:         'பயன்பாட்டு மொழி',
    voice_language:       'குரல் மொழி',
    notifications:        'அறிவிப்புகள்',
    med_reminders:        'மருந்து நினைவூட்டல்கள்',
    daily_checkin:        'தினசரி செக்-இன்',
    caregiver_alerts:     'பராமரிப்பாளர் எச்சரிக்கைகள்',
    doctor_contact:       'மருத்துவர் தொடர்பு',
    doctor_name:          'மருத்துவர் பெயர்',
    doctor_phone:         'மருத்துவர் தொலைபேசி',
    caregiver_contact:    'பராமரிப்பாளர் தொடர்பு',
    caregiver_name:       'பெயர்',
    caregiver_phone:      'தொலைபேசி',
    save_changes:         'மாற்றங்களை சேமி',
    toast_checkin_saved:  '✅ செக்-இன் சேமிக்கப்பட்டது!',
    toast_high_risk:      '🚨 அதிக ஆபத்து கண்டறியப்பட்டது! உதவி தேடுங்கள்.',
    toast_medium_risk:    '⚠️ உங்கள் அறிகுறிகளை கவனமாக கண்காணியுங்கள்.',
    toast_low_risk:       '✅ நீங்கள் நன்றாக இருக்கிறீர்கள்!',
    toast_updating:       '⏳ பகுப்பாய்வு புதுப்பிக்கிறது…',
    toast_caregiver:      '🔔 பராமரிப்பாளருக்கு தெரிவிக்கப்பட்டது!',
    toast_profile_saved:  '✅ சுயவிவரம் சேமிக்கப்பட்டது!',
    msg_low:              'நீங்கள் நன்றாக இருக்கிறீர்கள்! ஓய்வெடுங்கள், நீர் அருந்துங்கள்.',
    msg_medium:           'சில அறிகுறிகளுக்கு கவனம் தேவை. இன்று கவனமாக இருங்கள்.',
    msg_high:             'உங்கள் அறிகுறிகளுக்கு உடனடி மருத்துவ கவனிப்பு தேவை.',
    status_you_well:      'நீங்கள் நன்றாக இருக்கிறீர்கள்',
    status_monitor:       'கண்காணித்துக் கொண்டே இருங்கள்',
    status_seek_help:     'மருத்துவ உதவி தேடுங்கள்',
    status_low_risk:      'குறைந்த ஆபத்து',
    status_medium_risk:   'நடுத்தர ஆபத்து',
    status_high_risk:     'அதிக ஆபத்து',
  },

  te: {
    welcome_heading:      'ఈరోజు మీకు ఎలా అనిపిస్తోంది?',
    welcome_sub:          'కింద బటన్ నొక్కి మీరు ఎలా ఉన్నారో చెప్పండి.',
    start_checkin:        'రోజువారీ చెక్-ఇన్ ప్రారంభించు',
    last_checkin:         'చివరి చెక్-ఇన్',
    recovery_progress:    'కోలుకోవడం\nప్రగతి',
    medication_reminder:  'మందు\nగుర్తు',
    emergency_help:       'అత్యవసర\nసహాయం',
    nav_home:             'హోమ్',
    nav_progress:         'ప్రగతి',
    nav_meds:             'మందులు',
    nav_profile:          'ప్రొఫైల్',
    checkin_title:        'రోజువారీ చెక్-ఇన్',
    listening:            'వింటున్నాను… మాట్లాడండి',
    listen_init:          'వింటున్నాను…',
    done_rerecord:        'పూర్తయింది! మళ్ళీ రికార్డ్ చేయడానికి నొక్కండి.',
    type_below:           'కింద లక్షణాలు టైప్ చేయండి',
    transcript_ph:        'మీ మాటలు ఇక్కడ కనిపిస్తాయి…',
    edit_manually:        '✏️ మాన్యువల్‌గా సవరించు',
    analyze_btn:          'లక్షణాలు విశ్లేషించు',
    analyzing:            'విశ్లేషిస్తోంది…',
    voice_fallback:       '🎤 ఈ బ్రౌజర్‌లో వాయిస్ మద్దతు లేదు. కింద టైప్ చేయండి.',
    mic_denied:           '🎤 మైక్రోఫోన్ అనుమతి నిరాకరించబడింది.',
    no_speech:            '🔇 మాట్లాడటం గుర్తించబడలేదు. స్పష్టంగా మాట్లాడండి.',
    net_error:            '🌐 నెట్‌వర్క్ దోషం. కనెక్షన్ తనిఖీ చేయండి.',
    result_title:         'మీ ఫలితాలు',
    risk_level_label:     'ప్రమాద స్థాయి',
    risk_low:             'తక్కువ',
    risk_medium:          'మధ్యస్థ',
    risk_high:            'అధిక',
    ai_confidence:        'AI విశ్వాసం',
    uncertainty_msg:      '⚠️ మేము పూర్తిగా నిశ్చయంగా లేము. మరికొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    why_result:           'ఈ ఫలితం ఎందుకు?',
    what_do:              'మీరు ఏమి చేయాలి?',
    answer_followup:      'అనుసరణ ప్రశ్నలకు సమాధానం ఇవ్వండి',
    done:                 'పూర్తయింది ✓',
    followup_title:       'కొన్ని ప్రశ్నలు',
    question_of:          'ప్రశ్న {n} యొక్క {total}',
    ans_yes:              'అవును',
    ans_no:               'కాదు',
    ans_unsure:           'నిశ్చయం లేదు',
    voice_reply:          '🎙️ వాయిస్‌తో సమాధానం ఇవ్వండి',
    recovery_title:       'కోలుకోవడం ప్రగతి',
    recovery_day:         'కోలుకోవడం ప్రయాణంలో రోజు {n}',
    pain_trend:           'నొప్పి స్థాయి ధోరణి',
    risk_history:         'ప్రమాద స్థాయి చరిత్ర',
    recent_alerts:        'ఇటీవలి హెచ్చరికలు',
    no_alerts:            '✅ హెచ్చరికలు లేవు — అద్భుతంగా కొనసాగండి!',
    meds_title:           'మందులు',
    meds_sub:             'ఈరోజు షెడ్యూల్ — సమయానికి తీసుకోండి 💊',
    add_medicine:         'మందు జోడించు',
    no_meds:              '💊 ఇంకా మందులు లేవు. "జోడించు" నొక్కండి.',
    med_taken:            'తీసుకున్నారు',
    med_pending:          'పెండింగ్',
    med_doctor_note:      'మందు మార్చే ముందు మీ డాక్టర్‌ని సంప్రదించండి.',
    choose_icon:          'చిహ్నం ఎంచుకోండి',
    med_name_label:       'మందు పేరు',
    dose_label:           'మోతాదు & సూచనలు',
    time_label:           'సమయం',
    med_name_ph:          'ఉదా. Paracetamol',
    dose_ph:              'ఉదా. 500mg — భోజనం తర్వాత 1 మాత్ర',
    med_name_error:       'దయచేసి మందు పేరు నమోదు చేయండి.',
    save_med:             '💊 మందు జోడించు',
    saving:               'సేవ్ అవుతోంది…',
    emerg_heading:        'వెంటనే వైద్య సహాయం పొందండి',
    emerg_sub:            'మీ లక్షణాలు అత్యవసర శ్రద్ధ అవసరమని సూచిస్తున్నాయి.',
    call_doctor:          '📞 డాక్టర్‌కి కాల్ చేయండి',
    notify_caregiver:     '🔔 సంరక్షకుడికి తెలియజేయండి',
    im_okay:              '← నేను బాగున్నాను, వెనక్కి వెళ్ళండి',
    nearest_hospital:     '🏥 సమీపంలో:',
    km_away:              'కి.మీ దూరం',
    profile_title:        'ప్రొఫైల్ & సెట్టింగ్‌లు',
    patient_info:         'రోగి సమాచారం',
    full_name:            'పూర్తి పేరు',
    age:                  'వయసు',
    surgery_type:         'శస్త్రచికిత్స రకం',
    surgery_date:         'శస్త్రచికిత్స తేదీ',
    lang_settings:        'భాష',
    app_language:         'యాప్ భాష',
    voice_language:       'వాయిస్ భాష',
    notifications:        'నోటిఫికేషన్లు',
    med_reminders:        'మందు రిమైండర్లు',
    daily_checkin:        'రోజువారీ చెక్-ఇన్',
    caregiver_alerts:     'సంరక్షక హెచ్చరికలు',
    doctor_contact:       'డాక్టర్ సంప్రదింపు',
    doctor_name:          'డాక్టర్ పేరు',
    doctor_phone:         'డాక్టర్ ఫోన్',
    caregiver_contact:    'సంరక్షక సంప్రదింపు',
    caregiver_name:       'పేరు',
    caregiver_phone:      'ఫోన్',
    save_changes:         'మార్పులు సేవ్ చేయండి',
    toast_checkin_saved:  '✅ చెక్-ఇన్ సేవ్ చేయబడింది!',
    toast_high_risk:      '🚨 అధిక ప్రమాదం గుర్తించారు! వెంటనే సహాయం తీసుకోండి.',
    toast_medium_risk:    '⚠️ మీ లక్షణాలను జాగ్రత్తగా పర్యవేక్షించండి.',
    toast_low_risk:       '✅ మీరు బాగా చేస్తున్నారు!',
    toast_updating:       '⏳ విశ్లేషణ నవీకరిస్తోంది…',
    toast_caregiver:      '🔔 సంరక్షకుడికి తెలియజేయబడింది!',
    toast_profile_saved:  '✅ ప్రొఫైల్ సేవ్ అయింది!',
    msg_low:              'మీరు బాగా ఉన్నారు! విశ్రాంతి తీసుకోండి, నీళ్ళు తాగండి.',
    msg_medium:           'కొన్ని లక్షణాలకు శ్రద్ధ అవసరం. ఈరోజు జాగ్రత్తగా ఉండండి.',
    msg_high:             'మీ లక్షణాలకు వెంటనే వైద్య సేవ అవసరం.',
    status_you_well:      'మీరు బాగా ఉన్నారు',
    status_monitor:       'పర్యవేక్షిస్తూ ఉండండి',
    status_seek_help:     'వైద్య సహాయం పొందండి',
    status_low_risk:      'తక్కువ ప్రమాదం',
    status_medium_risk:   'మధ్యస్థ ప్రమాదం',
    status_high_risk:     'అధిక ప్రమాదం',
  }
};

// ── Language state ──
let currentLang = localStorage.getItem('recovo_lang') || 'en';
let currentVoiceLang = localStorage.getItem('recovo_voice_lang') || 'en-IN';

function t(key, vars = {}) {
  let str = (TRANSLATIONS[currentLang] || TRANSLATIONS.en)[key] || TRANSLATIONS.en[key] || key;
  Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
  return str;
}

// Apply translations to elements with data-i18n attribute
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translated = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translated;
    } else {
      el.textContent = translated;
    }
  });

  // Update specific dynamic text
  const wh = document.querySelector('.welcome-heading');
  if (wh) wh.textContent = t('welcome_heading');
  const ws = document.querySelector('.welcome-sub');
  if (ws) ws.textContent = t('welcome_sub');
  const ml = document.querySelector('.mic-label');
  if (ml) ml.textContent = t('start_checkin');

  // Nav labels
  const navBtns = document.querySelectorAll('.nav-btn span');
  const navKeys = ['nav_home','nav_progress','nav_meds','nav_profile'];
  navBtns.forEach((span, i) => { if (navKeys[i]) span.textContent = t(navKeys[i]); });

  // Checkin screen
  const listenStatus = $('listen-status');
  if (listenStatus && !recording) listenStatus.textContent = t('listen_init');
  const editBtn = $('btn-edit-transcript');
  if (editBtn) editBtn.textContent = t('edit_manually');
  const analyzeBtn = $('btn-analyze');
  if (analyzeBtn && !analyzeBtn.disabled) analyzeBtn.textContent = t('analyze_btn');

  // Manual input placeholder
  const manualInput = $('manual-input');
  if (manualInput) manualInput.placeholder = t('type_below');

  // Transcript placeholder
  const tBox = $('transcript-box');
  const tPh = tBox?.querySelector('.transcript-placeholder');
  if (tPh) tPh.textContent = t('transcript_ph');

  // Follow-up answers
  const ansBtns = document.querySelectorAll('.answer-btn');
  if (ansBtns[0]) ansBtns[0].textContent = t('ans_yes');
  if (ansBtns[1]) ansBtns[1].textContent = t('ans_no');
  if (ansBtns[2]) ansBtns[2].textContent = t('ans_unsure');

  // Recovery
  const pHead = document.querySelector('#screen-recovery .page-heading');
  if (pHead) pHead.textContent = t('recovery_title');
  const recSub = document.querySelector('#screen-recovery .page-sub strong');
  const recSubEl = document.querySelector('#screen-recovery .page-sub');
  if (recSubEl && recSub) {
    const day = recSub.textContent;
    recSubEl.innerHTML = t('recovery_day', { n: day });
  }
  const chartHeadings = document.querySelectorAll('.chart-card .card-heading');
  if (chartHeadings[0]) chartHeadings[0].textContent = t('pain_trend');
  if (chartHeadings[1]) chartHeadings[1].textContent = t('risk_history');

  // Meds
  const medsHeading = document.querySelector('#screen-meds .page-heading');
  if (medsHeading) medsHeading.textContent = t('meds_title');
  const medsSub = document.querySelector('#screen-meds .page-sub');
  if (medsSub) medsSub.textContent = t('meds_sub');
  const addMedBtn = $('btn-open-add-med');
  if (addMedBtn) {
    // Preserve the SVG and add text
    const svg = addMedBtn.querySelector('svg');
    addMedBtn.textContent = ' ' + t('add_medicine');
    if (svg) addMedBtn.prepend(svg);
  }

  // Profile
  const profileTitle = document.querySelector('#screen-profile .page-heading');
  if (profileTitle) profileTitle.textContent = t('profile_title');
  const saveBtn = $('btn-save-profile');
  if (saveBtn) saveBtn.textContent = t('save_changes');
}

// ── Screen Navigation ──
let currentScreen = 'home';
function goTo(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) { target.classList.add('active'); currentScreen = name; }
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === name);
  });
  window.scrollTo(0, 0);

  if (name === 'recovery') {
    requestAnimationFrame(() => {
      setTimeout(refreshCharts, 60);
    });
  }
}
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const screen = btn.dataset.screen;
    goTo(screen);
    // Lazy-load data on nav
    if (screen === 'recovery') loadRecovery();
    if (screen === 'meds') loadMeds();
    if (screen === 'profile') loadProfile();
  });
});

// ── Home Date ──
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();
$('home-date').textContent =
  DAYS[now.getDay()] + ', ' + MONTHS[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();

// ── Home: load latest check-in ──
async function loadLatestCheckin() {
  const res = await apiFetch('/checkin/latest');
  if (!res?.data) return;
  const c = res.data;
  const dot = document.querySelector('.status-dot');
  const val = document.querySelector('.status-value');
  const badgeMap = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
  const dotMap   = { low: 'dot-low', medium: 'dot-medium', high: 'dot-high' };
  const msgMap   = { low: t('status_you_well'), medium: t('status_monitor'), high: t('status_seek_help') };
  const labelMap = { low: t('status_low_risk'), medium: t('status_medium_risk'), high: t('status_high_risk') };
  const d = new Date(c.checked_in_at);
  document.querySelector('.status-meta').textContent =
    `${t('last_checkin')} · ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  dot.className = 'status-dot ' + (dotMap[c.risk_level] || 'dot-low');
  val.innerHTML = `${msgMap[c.risk_level] || t('status_you_well')} <span class="status-badge ${badgeMap[c.risk_level]}">${labelMap[c.risk_level]}</span>`;
}
loadLatestCheckin();

// ── Nav shortcuts ──
$('btn-go-profile').addEventListener('click', () => { goTo('profile'); loadProfile(); });
$('btn-go-recovery').addEventListener('click', () => { goTo('recovery'); loadRecovery(); });
$('btn-go-meds').addEventListener('click', () => { goTo('meds'); loadMeds(); });
$('btn-go-emergency').addEventListener('click', () => goTo('emergency'));
$('btn-start-checkin').addEventListener('click', () => { goTo('checkin'); startCheckin(); });

// ── Patient State ──
let currentPatient = {
  name: 'Ramesh Kumar',
  doctor_name: 'Dr. Rajesh Sharma',
  doctor_phone: '+91 98123 45678',
  caregiver_name: 'Priya Kumar',
  caregiver_phone: '+91 98765 43210'
};

async function loadPatientData() {
  const res = await apiFetch('/patient');
  if (res?.data) {
    currentPatient = { ...currentPatient, ...res.data };
  }
}
loadPatientData();

// ── Emergency ──
$('btn-back-emergency').addEventListener('click', () => goTo('home'));

$('btn-call-doctor').addEventListener('click', () => {
  const docName = currentPatient.doctor_name || 'Doctor';
  const rawPhone = currentPatient.doctor_phone || '+91 98123 45678';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

  showToast(`📞 Dialing ${docName} (${rawPhone})...`, 4000);

  // Synchronous call trigger - preserves direct user gesture!
  window.location.href = `tel:${cleanPhone}`;

  // Log emergency action asynchronously without blocking dialer
  apiFetch('/emergency/notify', {
    method: 'POST',
    body: { action: 'doctor_called' }
  });
});

$('btn-notify-caregiver').addEventListener('click', () => {
  const cgName = currentPatient.caregiver_name || 'Caregiver';
  const rawPhone = currentPatient.caregiver_phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

  showToast(`🔔 Notifying ${cgName} (${rawPhone})...`, 4000);

  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent("EMERGENCY: I need urgent medical assistance. Please check on me.")}`;
  }

  apiFetch('/emergency/notify', {
    method: 'POST',
    body: { action: 'caregiver_notified' }
  });
});

// ── CHECK-IN SCREEN — Real Web Speech API ──
let recording = false, currentTranscript = '';
let lastCheckinId = null;
let recognition = null;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognition;

function initRecognition() {
  if (!speechSupported) return null;
  const r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;
  r.lang = currentVoiceLang;
  r.maxAlternatives = 1;

  r.onstart = () => {
    recording = true;
    $('btn-mic-checkin').classList.add('recording');
    $('waveform').classList.remove('paused');
    $('listen-status').textContent = t('listening');
    $('btn-analyze').disabled = true;
  };

  r.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const tx = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += tx + ' ';
      else interim += tx;
    }
    if (final) currentTranscript += final;
    const box = $('transcript-box');
    box.innerHTML = '';
    if (currentTranscript) {
      const p = document.createElement('p');
      p.textContent = currentTranscript;
      box.appendChild(p);
    }
    if (interim) {
      const span = document.createElement('span');
      span.style.cssText = 'color:#94a3b8;font-style:italic';
      span.textContent = interim;
      box.appendChild(span);
    }
    if (currentTranscript.trim()) $('btn-analyze').disabled = false;
  };

  r.onerror = (event) => {
    stopRecognition();
    const messages = {
      'not-allowed': t('mic_denied'),
      'no-speech':   t('no_speech'),
      'network':     t('net_error'),
      'aborted':     null
    };
    const msg = messages[event.error];
    if (msg) showToast(msg, 4000);
  };

  r.onend = () => {
    if (recording) {
      try { r.start(); } catch (_) { stopRecognition(); }
    }
  };

  return r;
}

function startRecognition() {
  const box = $('transcript-box');

  if (!speechSupported) {
    showToast(t('voice_fallback'), 4000);
    const ta = $('manual-input');
    ta.classList.remove('hidden');
    ta.focus();
    $('btn-analyze').disabled = false;
    $('listen-status').textContent = t('type_below');
    return;
  }

  currentTranscript = '';
  box.innerHTML = `<p class="transcript-placeholder">${t('transcript_ph')}</p>`;
  $('btn-analyze').disabled = true;
  $('manual-input').classList.add('hidden');

  recognition = initRecognition();
  try {
    recognition.start();
  } catch (e) {
    showToast('🎤 Could not start microphone: ' + e.message, 3500);
  }
}

function stopRecognition() {
  recording = false;
  $('btn-mic-checkin').classList.remove('recording');
  $('waveform').classList.add('paused');
  $('listen-status').textContent = t('done_rerecord');
  if (recognition) {
    try { recognition.stop(); } catch (_) {}
    recognition = null;
  }
  if (currentTranscript.trim()) $('btn-analyze').disabled = false;
}

function startCheckin() { startRecognition(); }

$('btn-mic-checkin').addEventListener('click', () => {
  if (recording) stopRecognition();
  else startRecognition();
});

$('btn-back-checkin').addEventListener('click', () => { stopRecognition(); goTo('home'); });

$('btn-edit-transcript').addEventListener('click', () => {
  const ta = $('manual-input');
  ta.classList.toggle('hidden');
  if (!ta.classList.contains('hidden')) {
    ta.value = currentTranscript;
    ta.focus();
    $('btn-analyze').disabled = false;
  }
});

$('btn-analyze').addEventListener('click', async () => {
  const ta = $('manual-input');
  if (!ta.classList.contains('hidden') && ta.value.trim()) {
    currentTranscript = ta.value.trim();
    const box = $('transcript-box');
    box.innerHTML = '<p>' + currentTranscript + '</p>';
  }

  const btn = $('btn-analyze');
  btn.textContent = t('analyzing');
  btn.disabled = true;

  const res = await apiFetch('/checkin', {
    method: 'POST',
    body: { transcript: currentTranscript }
  });

  btn.textContent = t('analyze_btn');
  btn.disabled = false;

  if (res?.success) {
    lastCheckinId = res.checkinId;
    renderResult(res.analysis);
  } else {
    renderResult(demoAnalysis(currentTranscript));
  }
});

// ── RESULT SCREEN ──
function renderResult(analysis) {
  const { riskLevel, confidence, message, reasons, action, followUpNeeded } = analysis;

  const card = $('result-risk-card');
  card.className = 'result-risk-card risk-' + riskLevel;
  const badgeMap = { low: t('risk_low'), medium: t('risk_medium'), high: t('risk_high') };
  const iconMap  = { low: '✅', medium: '⚠️', high: '🚨' };
  $('result-risk-badge').textContent = badgeMap[riskLevel];
  $('result-risk-badge').className = 'risk-badge badge-' + riskLevel;
  $('result-risk-icon').textContent = iconMap[riskLevel];
  $('result-risk-msg').textContent = t('msg_' + riskLevel) || message;
  $('result-conf-pct').textContent = confidence + '%';
  $('result-conf-bar').style.width = confidence + '%';

  const um = $('uncertainty-msg');
  um.textContent = t('uncertainty_msg');
  um.classList.toggle('hidden', !followUpNeeded);
  const rl = $('reason-list');
  rl.innerHTML = (reasons || []).map(r => `<li>${r}</li>`).join('');
  $('action-text').textContent = action;

  // Why / What card headings
  const cardHeadings = document.querySelectorAll('#screen-result .card-heading');
  if (cardHeadings[0]) cardHeadings[0].textContent = t('why_result');
  if (cardHeadings[1]) cardHeadings[1].textContent = t('what_do');

  // AI Confidence label
  const confLabel = document.querySelector('#screen-result .info-label');
  if (confLabel) confLabel.textContent = t('ai_confidence');

  // Buttons
  $('btn-ask-followup').textContent = t('answer_followup');
  $('btn-done-result').textContent = t('done');

  // Show emergency button for high risk
  const actionCard = $('action-card');
  const existingEmerg = document.getElementById('btn-go-emergency-result');
  if (riskLevel === 'high' && !existingEmerg) {
    const emergBtn = document.createElement('button');
    emergBtn.id = 'btn-go-emergency-result';
    emergBtn.className = 'btn-primary';
    emergBtn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    emergBtn.textContent = '🚨 ' + t('emergency_help').replace('\n', ' ');
    emergBtn.addEventListener('click', () => goTo('emergency'));
    actionCard.appendChild(emergBtn);
  } else if (riskLevel !== 'high' && existingEmerg) {
    existingEmerg.remove();
  }

  goTo('result');
  if (riskLevel === 'high') showToast(t('toast_high_risk'), 4000);
  else if (riskLevel === 'medium') showToast(t('toast_medium_risk'), 3000);
  else showToast(t('toast_low_risk'), 2500);
}

function demoAnalysis(text) {
  const lower = text.toLowerCase();
  if (lower.includes('severe') || lower.includes('fever') || lower.includes('8/10') || lower.includes('9/10')) {
    return { riskLevel:'high', confidence:77, message:t('msg_high'), reasons:['High pain level','Possible infection signs','Urgent evaluation needed'], action:'Please visit your doctor or ER immediately.', followUpNeeded:false };
  } else if (lower.includes('swelling') || lower.includes('5/10') || lower.includes('warm')) {
    return { riskLevel:'medium', confidence:61, message:t('msg_medium'), reasons:['Moderate pain reported','Swelling mentioned','Warmth near wound'], action:'Monitor symptoms. Call your doctor if it worsens.', followUpNeeded:true };
  }
  return { riskLevel:'low', confidence:84, message:t('msg_low'), reasons:['Mild or no pain reported','No infection signs','Normal recovery progress'], action:'Rest and take your medications on time.', followUpNeeded:false };
}

$('btn-back-result').addEventListener('click', () => goTo('checkin'));
$('btn-done-result').addEventListener('click', () => { loadLatestCheckin(); showToast(t('toast_checkin_saved')); goTo('home'); });
$('btn-ask-followup').addEventListener('click', () => { startFollowup(); goTo('followup'); });

// ── FOLLOW-UP QUESTIONS ──
const QUESTIONS_EN = [
  "Do you have any swelling or redness around your wound?",
  "Have you had a fever in the last 24 hours?",
  "Are you able to take your meals and medicines normally?"
];
const QUESTIONS_HI = [
  "क्या आपके घाव के आसपास सूजन या लालिमा है?",
  "क्या आपको पिछले 24 घंटों में बुखार आया?",
  "क्या आप सामान्य रूप से भोजन और दवाएँ ले पा रहे हैं?"
];
const QUESTIONS_TA = [
  "உங்கள் காயத்தை சுற்றி வீக்கம் அல்லது சிவப்பு உள்ளதா?",
  "கடந்த 24 மணி நேரத்தில் காய்ச்சல் வந்ததா?",
  "இயல்பாக உணவு மற்றும் மருந்துகளை எடுக்கிறீர்களா?"
];
const QUESTIONS_TE = [
  "మీ గాయం చుట్టూ వాపు లేదా ఎరుపు ఉందా?",
  "గత 24 గంటల్లో జ్వరం వచ్చిందా?",
  "సాధారణంగా భోజనం మరియు మందులు తీసుకుంటున్నారా?"
];

function getQuestions() {
  const qMap = { en: QUESTIONS_EN, hi: QUESTIONS_HI, ta: QUESTIONS_TA, te: QUESTIONS_TE };
  return qMap[currentLang] || QUESTIONS_EN;
}

let fqIndex = 0;
const fqAnswers = [];

function startFollowup() { fqIndex = 0; fqAnswers.length = 0; renderFollowup(); }

function renderFollowup() {
  const questions = getQuestions();
  $('followup-question').textContent = questions[fqIndex];
  $('followup-counter').textContent = t('question_of', { n: fqIndex + 1, total: questions.length });
  $('followup-progress-fill').style.width = ((fqIndex / questions.length) * 100) + '%';
  document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));

  // Update answer button labels
  const ansBtns = document.querySelectorAll('.answer-btn');
  if (ansBtns[0]) ansBtns[0].textContent = t('ans_yes');
  if (ansBtns[1]) ansBtns[1].textContent = t('ans_no');
  if (ansBtns[2]) ansBtns[2].textContent = t('ans_unsure');
}

// Follow-up screen title
document.querySelector('#screen-followup .screen-title').textContent = t('followup_title');

document.querySelectorAll('.answer-btn').forEach(btn => {
  btn.addEventListener('click', async function() {
    const questions = getQuestions();
    document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    fqAnswers.push({ question: questions[fqIndex], answer: this.dataset.val });
    setTimeout(async () => {
      fqIndex++;
      if (fqIndex < questions.length) {
        renderFollowup();
      } else {
        $('followup-progress-fill').style.width = '100%';
        showToast(t('toast_updating'));
        if (lastCheckinId) {
          const res = await apiFetch(`/checkin/${lastCheckinId}/followup`, {
            method: 'POST',
            body: { answers: fqAnswers }
          });
          if (res?.success) { renderResult(res.analysis); return; }
        }
        setTimeout(() => goTo('result'), 1200);
      }
    }, 500);
  });
});
$('btn-back-followup').addEventListener('click', () => goTo('result'));

// ── RECOVERY DASHBOARD ──
async function loadRecovery() {
  const res = await apiFetch('/recovery');
  if (!res?.success) { buildDemoTimeline(); initCharts(null); return; }
  const { recoveryDay, timeline, painTrend, riskTrend, alerts } = res.data;

  $('recovery-day').textContent = recoveryDay;

  // Update page sub with translation
  const recSub = document.querySelector('#screen-recovery .page-sub');
  if (recSub) recSub.innerHTML = t('recovery_day', { n: `<strong id="recovery-day">${recoveryDay}</strong>` });

  buildTimeline(timeline);
  initCharts({ painTrend, riskTrend });
  buildAlerts(alerts, timeline);
}

$('btn-generate-report')?.addEventListener('click', async () => {
  showToast('⏳ Generating report...');
  const res = await apiFetch('/recovery');
  if (!res?.success) return showToast('❌ Failed to load data for report');
  
  const { recoveryDay, timeline, alerts } = res.data;
  
  let report = `RECOVO AI - Progress Report\n`;
  report += `==================================\n`;
  report += `Date: ${new Date().toLocaleDateString()}\n`;
  report += `Recovery Day: ${recoveryDay}\n\n`;
  
  report += `--- TIMELINE ---\n`;
  if (timeline && timeline.length) {
    timeline.forEach(t => {
      report += `Day ${t.day} (${t.date || 'N/A'}): Risk Level - ${t.riskLevel.toUpperCase()}, Pain Level - ${t.painLevel}/10\n`;
    });
  } else {
    report += `No data available yet.\n`;
  }
  
  report += `\n--- RECENT ALERTS ---\n`;
  if (alerts && alerts.length) {
    alerts.forEach(a => {
      report += `Day ${a.day} (${a.date.split(' ')[0]}): Alert - ${a.riskLevel.toUpperCase()} RISK\n`;
    });
  } else {
    report += `No significant alerts. Keep up the good work!\n`;
  }
  
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Recovo_Progress_Report_Day_${recoveryDay}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('✅ Report Downloaded');
});

function buildTimeline(data) {
  const track = $('timeline-track');
  track.innerHTML = '';
  const levelData = data || [];
  if (levelData.length === 0) { buildDemoTimeline(); return; }
  levelData.forEach((d, i) => {
    const el = document.createElement('div');
    const isCurrent = i === levelData.length - 1;
    el.className = `timeline-day day-${d.riskLevel}${isCurrent ? ' day-current' : ''}`;
    const emoji = { low:'✅', medium:'⚠️', high:'🚨' }[d.riskLevel] || '✅';
    el.innerHTML = `<span>${emoji}</span><span class="day-num">${d.day}</span><span>Day</span>`;
    track.appendChild(el);
  });
}

function buildDemoTimeline() {
  const track = $('timeline-track');
  track.innerHTML = '';
  const demo = ['low','low','medium','low','low'];
  const emojis = ['✅','✅','⚠️','✅','✅'];
  demo.forEach((lv, i) => {
    const el = document.createElement('div');
    el.className = `timeline-day day-${lv}${i===4?' day-current':''}`;
    el.innerHTML = `<span>${emojis[i]}</span><span class="day-num">${i+1}</span><span>Day</span>`;
    track.appendChild(el);
  });
}

function buildAlerts(alerts, timeline) {
  const list = $('alert-list');
  if (!alerts || alerts.length === 0) {
    list.innerHTML = `<div class="alert-item alert-ok">${t('no_alerts')}</div>`;
    return;
  }
  const okDays = (timeline || []).filter(tl => tl.riskLevel === 'low');
  list.innerHTML = '';
  alerts.forEach(a => {
    const el = document.createElement('div');
    el.className = `alert-item alert-warn`;
    el.textContent = `${a.riskLevel === 'high' ? '🚨' : '⚠️'} Day ${a.day} — ${a.riskLevel === 'high' ? 'High risk' : 'Moderate symptoms'} reported`;
    list.appendChild(el);
  });
  okDays.slice(-2).forEach((d) => {
    const el = document.createElement('div');
    el.className = 'alert-item alert-ok';
    el.textContent = `✅ Day ${d.day} — All vitals normal`;
    list.appendChild(el);
  });
}

let cachedChartData = null;

function initCharts(data) {
  if (data) cachedChartData = data;
  refreshCharts();
}

function refreshCharts() {
  const data = cachedChartData;
  const painData = (data?.painTrend?.length) ? data.painTrend.map(d => d.value) : [7, 6, 8, 5, 3];
  const painLabels = (data?.painTrend?.length) ? data.painTrend.map(d => d.label) : ['D1', 'D2', 'D3', 'D4', 'D5'];
  const riskData = (data?.riskTrend?.length) ? data.riskTrend.map(d => d.value) : [1, 1, 2, 1, 1];
  const riskLabels = (data?.riskTrend?.length) ? data.riskTrend.map(d => d.label) : ['D1', 'D2', 'D3', 'D4', 'D5'];

  drawChart('pain-chart', painLabels, painData, 'pain');
  drawChart('risk-chart', riskLabels, riskData, 'risk');
}

function drawChart(canvasId, labels, data, type) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const card = canvas.parentElement;
  const cardWidth = card ? card.clientWidth - 48 : 320;
  const appShell = document.getElementById('app');
  const fallbackW = appShell ? appShell.clientWidth - 48 : 340;
  
  const W = Math.max(260, canvas.offsetWidth || cardWidth || fallbackW);
  const H = 160;
  const ratio = window.devicePixelRatio || 1;
  
  canvas.width = Math.floor(W * ratio);
  canvas.height = Math.floor(H * ratio);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  
  ctx.save();
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, W, H);

  const isDark = !document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const painValColor = isDark ? '#38bdf8' : '#0284c7';

  if (!data || data.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = '500 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No recovery data available yet', W / 2, H / 2);
    ctx.restore();
    return;
  }

  const isPain = type === 'pain';
  const primaryColor = isPain ? '#3b82f6' : '#10b981';
  const pad = { top: 28, right: 24, bottom: 28, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // 1. Grid lines and Y-axis labels
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = textColor;
  ctx.font = '600 10px Outfit, sans-serif';
  ctx.textAlign = 'right';

  if (isPain) {
    const ySteps = [{ val: 10, label: '10' }, { val: 5, label: '5' }, { val: 0, label: '0' }];
    ySteps.forEach(step => {
      const y = pad.top + chartH - (step.val / 10) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillText(step.label, pad.left - 8, y + 3);
    });
  } else {
    const ySteps = [{ val: 3, label: 'High' }, { val: 2, label: 'Med' }, { val: 1, label: 'Low' }];
    ySteps.forEach(step => {
      const y = pad.top + chartH - ((step.val - 1) / 2) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillText(step.label, pad.left - 8, y + 3);
    });
  }

  // 2. Map data points
  const points = [];
  if (data.length === 1) {
    const x = pad.left + chartW / 2;
    const val = data[0];
    const normalizedY = isPain ? (val / 10) : ((val - 1) / 2);
    const y = pad.top + chartH - Math.max(0, Math.min(1, normalizedY)) * chartH;
    points.push({ x, y, val, label: labels[0] || 'D1' });
  } else {
    const step = chartW / (data.length - 1);
    data.forEach((v, i) => {
      const x = pad.left + i * step;
      const normalizedY = isPain ? (v / 10) : ((v - 1) / 2);
      const y = pad.top + chartH - Math.max(0, Math.min(1, normalizedY)) * chartH;
      points.push({ x, y, val: v, label: labels[i] || `D${i+1}` });
    });
  }

  // 3. Gradient Area Fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, primaryColor + '40');
  grad.addColorStop(1, primaryColor + '00');

  ctx.beginPath();
  if (points.length === 1) {
    ctx.moveTo(pad.left, points[0].y);
    ctx.lineTo(pad.left + chartW, points[0].y);
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
  } else {
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
    }
    ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
    ctx.lineTo(points[0].x, pad.top + chartH);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 4. Line stroke
  ctx.beginPath();
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (points.length === 1) {
    ctx.moveTo(pad.left, points[0].y);
    ctx.lineTo(pad.left + chartW, points[0].y);
  } else {
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
    }
  }
  ctx.stroke();

  // 5. Data Dots & Badges
  points.forEach((p) => {
    let dotColor = primaryColor;
    let badgeText = isPain ? `${p.val}/10` : (p.val === 3 ? 'High' : (p.val === 2 ? 'Med' : 'Low'));

    if (!isPain) {
      dotColor = p.val === 3 ? '#ef4444' : (p.val === 2 ? '#f59e0b' : '#10b981');
    }

    // Outer Glow Dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = dotColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Value text above dot
    ctx.fillStyle = isPain ? painValColor : dotColor;
    ctx.font = '700 10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, p.x, p.y - 8);

    // X-Axis Day Label below chart
    ctx.fillStyle = textColor;
    ctx.font = '500 10px Outfit, sans-serif';
    ctx.fillText(p.label, p.x, H - 8);
  });

  ctx.restore();
}

// ── MEDICATIONS ──
async function loadMeds() {
  const res = await apiFetch('/medications');
  const meds = res?.data || [
    { id:1, name:'Amoxicillin',  dose:'500mg — 1 capsule',           time_slot:'8:00 AM', icon:'💊', taken:true  },
    { id:2, name:'Ibuprofen',    dose:'400mg — 1 tablet after food', time_slot:'2:00 PM', icon:'🔴', taken:false },
    { id:3, name:'Pantoprazole', dose:'40mg — 1 tablet before food', time_slot:'8:00 PM', icon:'🟡', taken:false },
  ];
  renderMeds(meds);
}

function renderMeds(meds) {
  const list = $('med-list');
  list.innerHTML = '';
  if (meds.length === 0) {
    list.innerHTML = `<div class="info-card" style="text-align:center;"><p class="muted-text">${t('no_meds')}</p></div>`;
    return;
  }
  meds.forEach(m => {
    const card = document.createElement('div');
    card.className = 'med-card' + (m.taken ? ' taken' : '');
    card.innerHTML = `
      <div class="med-icon">${m.icon}</div>
      <div class="med-info">
        <div class="med-name">${m.name}</div>
        <div class="med-time">🕐 ${m.time_slot}</div>
        <div class="med-dose">${m.dose}</div>
      </div>
      <div class="med-toggle">
        <div class="toggle${m.taken ? ' active' : ''}" data-id="${m.id}" data-taken="${m.taken ? '1':'0'}"></div>
        <div class="med-status">${m.taken ? t('med_taken') : t('med_pending')}</div>
      </div>
      <button class="med-delete" data-id="${m.id}" title="Remove medicine">🗑️</button>`;
    list.appendChild(card);
  });

  list.querySelectorAll('.toggle').forEach(tog => {
    tog.addEventListener('click', async function() {
      const medId = this.dataset.id;
      const newTaken = this.dataset.taken !== '1';
      const res = await apiFetch(`/medications/${medId}/toggle`, {
        method: 'PUT',
        body: { taken: newTaken }
      });
      showToast(res?.message || (newTaken ? `✅ ${t('med_taken')}!` : `⏳ ${t('med_pending')}`));
      loadMeds();
    });
  });

  list.querySelectorAll('.med-delete').forEach(btn => {
    btn.addEventListener('click', async function() {
      const medId = this.dataset.id;
      const medName = this.closest('.med-card').querySelector('.med-name').textContent;
      if (!confirm(`Remove "${medName}" from your list?`)) return;
      const res = await apiFetch(`/medications/${medId}`, { method: 'DELETE' });
      showToast(res?.message || `❌ ${medName} removed`);
      loadMeds();
    });
  });
}

// ── ADD MEDICINE MODAL ──
let selectedIcon = '💊';

function openAddMedModal() {
  selectedIcon = '💊';
  $('med-name-input').value = '';
  $('med-dose-input').value = '';
  $('med-time-input').value = '08:00';
  $('med-form-error').classList.add('hidden');
  document.querySelectorAll('.icon-opt').forEach(b => b.classList.toggle('selected', b.dataset.icon === '💊'));
  $('modal-overlay').classList.remove('hidden');
  $('modal-add-med').classList.remove('hidden');

  // Translate modal
  document.querySelector('.modal-title').textContent = t('add_medicine');
  document.querySelector('.form-label[for="med-name-input"]').innerHTML = `${t('med_name_label')} <span class="req">*</span>`;
  document.querySelector('.form-label[for="med-dose-input"]').textContent = t('dose_label');
  document.querySelector('.form-label[for="med-time-input"]').textContent = t('time_label');
  $('med-name-input').placeholder = t('med_name_ph');
  $('med-dose-input').placeholder = t('dose_ph');
  $('med-form-error').textContent = t('med_name_error');
  $('btn-save-med').textContent = t('save_med');

  // Choose icon label
  const chooseIconLabel = document.querySelector('.form-label:first-of-type');
  if (chooseIconLabel && !chooseIconLabel.getAttribute('for')) chooseIconLabel.textContent = t('choose_icon');

  setTimeout(() => $('med-name-input').focus(), 300);
}

function closeAddMedModal() {
  $('modal-overlay').classList.add('hidden');
  $('modal-add-med').classList.add('hidden');
}

$('btn-open-add-med').addEventListener('click', openAddMedModal);
$('btn-close-add-med').addEventListener('click', closeAddMedModal);
$('modal-overlay').addEventListener('click', closeAddMedModal);

document.querySelectorAll('.icon-opt').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.icon-opt').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    selectedIcon = this.dataset.icon;
  });
});

$('btn-save-med').addEventListener('click', async () => {
  const name = $('med-name-input').value.trim();
  if (!name) {
    $('med-form-error').classList.remove('hidden');
    $('med-name-input').focus();
    return;
  }
  $('med-form-error').classList.add('hidden');

  const rawTime = $('med-time-input').value || '08:00';
  const [h, m] = rawTime.split(':');
  const hour = parseInt(h);
  const timeLabel = `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;

  const btn = $('btn-save-med');
  btn.textContent = t('saving'); btn.disabled = true;

  const res = await apiFetch('/medications', {
    method: 'POST',
    body: {
      name,
      dose: $('med-dose-input').value.trim() || `${name} — as prescribed`,
      time_slot: timeLabel,
      icon: selectedIcon
    }
  });

  btn.textContent = t('save_med'); btn.disabled = false;

  if (res?.success) {
    showToast(`✅ ${name} added!`);
    closeAddMedModal();
    loadMeds();
  } else {
    showToast('❌ Could not save. Try again.', 3000);
  }
});

$('med-name-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('med-dose-input').focus(); });
$('med-dose-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('med-time-input').focus(); });

// ── PROFILE ──
async function loadProfile() {
  const savedLang = localStorage.getItem('recovo_lang') || 'en';
  const savedVoiceLang = localStorage.getItem('recovo_voice_lang') || 'en-IN';
  const appLangSel = $('select-app-lang');
  const voiceLangSel = $('select-voice-lang');
  if (appLangSel) appLangSel.value = savedLang;
  if (voiceLangSel) voiceLangSel.value = savedVoiceLang;

  const res = await apiFetch('/patient');
  if (!res?.data) return;
  const p = res.data;
  currentPatient = { ...currentPatient, ...p };

  if ($('profile-name-input')) $('profile-name-input').value = p.name || '';
  if ($('profile-age-input')) $('profile-age-input').value = p.age || '';
  if ($('profile-surgery-input')) $('profile-surgery-input').value = p.surgery_type || '';
  if ($('profile-date-input')) $('profile-date-input').value = p.surgery_date || '';
  if ($('profile-doc-name-input')) $('profile-doc-name-input').value = p.doctor_name || 'Dr. Rajesh Sharma';
  if ($('profile-doc-phone-input')) $('profile-doc-phone-input').value = p.doctor_phone || '+91 98123 45678';
  if ($('profile-cg-name-input')) $('profile-cg-name-input').value = p.caregiver_name || '';
  if ($('profile-cg-phone-input')) $('profile-cg-phone-input').value = p.caregiver_phone || '';

  document.querySelector('.profile-name').textContent = p.name || 'Patient';
  document.querySelector('.profile-tag').textContent = `${p.surgery_type || 'Surgery'} · Age ${p.age || '—'}`;

  if (p.language && appLangSel) appLangSel.value = p.language;
}

// Save profile button
$('btn-save-profile').addEventListener('click', async () => {
  const appLang = $('select-app-lang')?.value || 'en';
  const voiceLang = $('select-voice-lang')?.value || 'en-IN';

  const name = $('profile-name-input')?.value || 'Patient';
  const age = $('profile-age-input')?.value || '';
  const surgery_type = $('profile-surgery-input')?.value || '';
  const surgery_date = $('profile-date-input')?.value || '';
  const doctor_name = $('profile-doc-name-input')?.value || '';
  const doctor_phone = $('profile-doc-phone-input')?.value || '';
  const caregiver_name = $('profile-cg-name-input')?.value || '';
  const caregiver_phone = $('profile-cg-phone-input')?.value || '';

  currentPatient = {
    ...currentPatient,
    name,
    age,
    surgery_type,
    surgery_date,
    doctor_name,
    doctor_phone,
    caregiver_name,
    caregiver_phone,
    language: appLang
  };

  const res = await apiFetch('/patient', {
    method: 'PUT',
    body: {
      name,
      age,
      surgery_type,
      surgery_date,
      doctor_name,
      doctor_phone,
      caregiver_name,
      caregiver_phone,
      language: appLang
    }
  });

  localStorage.setItem('recovo_lang', appLang);
  localStorage.setItem('recovo_voice_lang', voiceLang);
  currentLang = appLang;
  currentVoiceLang = voiceLang;

  document.querySelector('.profile-name').textContent = name;
  document.querySelector('.profile-tag').textContent = `${surgery_type || 'Surgery'} · Age ${age || '—'}`;

  applyTranslations();
  showToast(res?.message || t('toast_profile_saved'));
});

// Live language preview (changes UI immediately without saving)
$('select-app-lang').addEventListener('change', function() {
  currentLang = this.value;
  applyTranslations();
});

$('select-voice-lang').addEventListener('change', function() {
  currentVoiceLang = this.value;
  // Restart recognition with new language if active
  if (recording) {
    stopRecognition();
    startRecognition();
  }
});

// ── Toggle Switches (Settings) ──
document.querySelectorAll('.toggle[id]').forEach(tog => {
  // Restore state from localStorage
  const key = 'toggle_' + tog.id;
  const saved = localStorage.getItem(key);
  if (saved === 'off') tog.classList.remove('active');
  else if (saved === 'on') tog.classList.add('active');

  tog.addEventListener('click', function() {
    this.classList.toggle('active');
    localStorage.setItem('toggle_' + this.id, this.classList.contains('active') ? 'on' : 'off');
  });
});

// ── Theme Handling ──
function applyTheme() {
  const isDark = $('toggle-theme')?.classList.contains('active') ?? false;
  if (!isDark) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  if (currentScreen === 'recovery') {
    refreshCharts();
  }
}
$('toggle-theme')?.addEventListener('click', () => setTimeout(applyTheme, 0));
if (localStorage.getItem('toggle_toggle-theme') !== 'on') {
  document.documentElement.setAttribute('data-theme', 'light');
}

window.addEventListener('resize', () => {
  if (currentScreen === 'recovery') {
    refreshCharts();
  }
});

// ── Init ──
applyTranslations();
loadMeds();
loadRecovery();
applyTheme();
goTo('home');
