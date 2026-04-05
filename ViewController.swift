import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    
    var webView: WKWebView!
    var antiScreenshotEnabled = false
    var overlayView: UIView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupWebView()
        setupAntiScreenshot()
        
        if let url = URL(string: "http://127.0.0.1:8080") {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }
    
    func setupWebView() {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        let contentController = WKUserContentController()
        contentController.add(self, name: "WOFES")
        config.userContentController = contentController
        
        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        let customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        webView.customUserAgent = customUserAgent
        
        view.addSubview(webView)
        
        view.backgroundColor = UIColor(red: 0.04, green: 0.04, blue: 0.04, alpha: 1.0)
    }
    
    func setupAntiScreenshot() {
        enableAntiScreenshot()
    }
    
    func enableAntiScreenshot() {
        guard !antiScreenshotEnabled else { return }
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(hideContent),
            name: UIApplication.userDidTakeScreenshotNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(hideContent),
            name: UIScreen.capturedDidChangeNotification,
            object: nil
        )
        
        let field = UITextField()
        field.isSecureTextEntry = true
        field.isUserInteractionEnabled = false
        view.layer.superlayer?.addSublayer(field.layer)
        field.layer.sublayers?.first?.addSublayer(webView.layer)
        
        antiScreenshotEnabled = true
    }
    
    func disableAntiScreenshot() {
        guard antiScreenshotEnabled else { return }
        
        NotificationCenter.default.removeObserver(
            self,
            name: UIApplication.userDidTakeScreenshotNotification,
            object: nil
        )
        
        NotificationCenter.default.removeObserver(
            self,
            name: UIScreen.capturedDidChangeNotification,
            object: nil
        )
        
        antiScreenshotEnabled = false
    }
    
    @objc func hideContent() {
        if overlayView == nil {
            overlayView = UIView(frame: view.bounds)
            overlayView?.backgroundColor = .black
            overlayView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        }
        
        if let overlay = overlayView {
            view.addSubview(overlay)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                overlay.removeFromSuperview()
            }
        }
    }
    
    func webView(_ webView: WKWebView, 
                 decidePolicyFor navigationAction: WKNavigationAction, 
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        
        if let url = navigationAction.request.url {
            if url.absoluteString.contains(".onion") {
                decisionHandler(.cancel)
                return
            }
        }
        
        decisionHandler(.allow)
    }
    
    func webView(_ webView: WKWebView,
                 createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction,
                 windowFeatures: WKWindowFeatures) -> WKWebView? {
        
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        
        return nil
    }
    
    override var prefersStatusBarHidden: Bool {
        return true
    }
    
    override var prefersHomeIndicatorAutoHidden: Bool {
        return true
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

extension ViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, 
                              didReceive message: WKScriptMessage) {
        
        guard message.name == "WOFES" else { return }
        
        if let dict = message.body as? [String: Any],
           let action = dict["action"] as? String {
            
            switch action {
            case "enableAntiScreenshot":
                enableAntiScreenshot()
            case "disableAntiScreenshot":
                disableAntiScreenshot()
            case "getDeviceInfo":
                sendDeviceInfo()
            default:
                break
            }
        }
    }
    
    func sendDeviceInfo() {
        let info: [String: Any] = [
            "platform": "iOS",
            "version": UIDevice.current.systemVersion,
            "model": UIDevice.current.model,
            "isTablet": UIDevice.current.userInterfaceIdiom == .pad
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: info),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            let script = "window.deviceInfo = \(jsonString);"
            webView.evaluateJavaScript(script, completionHandler: nil)
        }
    }
}
