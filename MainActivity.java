package com.wofes.sff;

import android.app.Activity;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView webView;
    private boolean antiScreenshotEnabled = false;

    static {
        System.loadLibrary("wofes_platform_mobile");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        setupFullscreen();
        setupWebView();
        
        enableAntiScreenshotNative();
        
        String url = "http://127.0.0.1:8080";
        webView.loadUrl(url);
    }

    private void setupFullscreen() {
        View decorView = getWindow().getDecorView();
        int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        decorView.setSystemUiVisibility(uiOptions);
        
        getWindow().setStatusBarColor(Color.parseColor("#0a0a0a"));
        getWindow().setNavigationBarColor(Color.parseColor("#0a0a0a"));
    }

    private void setupWebView() {
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(getCustomUserAgent());
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.endsWith(".onion")) {
                    return true;
                }
                view.loadUrl(url);
                return true;
            }
        });
        
        webView.addJavascriptInterface(new WOFESBridge(this), "WOFES");
    }

    private String getCustomUserAgent() {
        return "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    }

    public void enableAntiScreenshot() {
        if (!antiScreenshotEnabled) {
            getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            );
            antiScreenshotEnabled = true;
            enableAntiScreenshotNative();
        }
    }

    public void disableAntiScreenshot() {
        if (antiScreenshotEnabled) {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            antiScreenshotEnabled = false;
            disableAntiScreenshotNative();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (webView != null) {
            webView.destroy();
        }
    }

    private native boolean enableAntiScreenshotNative();
    private native boolean disableAntiScreenshotNative();
    private native String getDeviceInfo();

    public class WOFESBridge {
        private Activity activity;

        public WOFESBridge(Activity activity) {
            this.activity = activity;
        }

        @android.webkit.JavascriptInterface
        public void enableAntiScreenshot() {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    MainActivity.this.enableAntiScreenshot();
                }
            });
        }

        @android.webkit.JavascriptInterface
        public void disableAntiScreenshot() {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    MainActivity.this.disableAntiScreenshot();
                }
            });
        }

        @android.webkit.JavascriptInterface
        public String getDeviceInfo() {
            return MainActivity.this.getDeviceInfo();
        }
    }
}
