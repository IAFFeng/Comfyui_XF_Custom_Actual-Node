import { app } from "../../scripts/app.js";

// 注册扩展，用于修改 Gemini 节点的 UI 行为
app.registerExtension({
    name: "Gemini.ApiKeyWidget",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        // 仅针对我们的 GeminiMattingNode 节点
        if (nodeData.name === "GeminiMattingNode") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                // 找到名为 "api_key" 的控件
                const widget = this.widgets.find((w) => w.name === "api_key");
                
                if (widget) {
                    // 1. 重写绘制方法 (Draw Method)
                    // 不直接显示文本，而是根据是否有值显示星号或提示
                    widget.draw = function (ctx, node, widget_width, y, widget_height) {
                        // 绘制背景
                        ctx.fillStyle = "#222"; // 深色背景
                        ctx.beginPath();
                        ctx.roundRect(0, y, widget_width, widget_height, 4);
                        ctx.fill();
                        
                        // 决定显示的文本颜色和内容
                        // 如果有值，显示绿色，否则显示灰色
                        const hasValue = this.value && this.value.length > 0;
                        ctx.fillStyle = hasValue ? "#6f6" : "#666"; 
                        
                        // 设置字体
                        ctx.font = "12px Arial";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        
                        // 安全掩码逻辑
                        let label = "Click to Enter API Key";
                        if (hasValue) {
                            label = "API Key Set: ************";
                        }
                        
                        ctx.fillText(label, widget_width * 0.5, y + widget_height * 0.5);
                    };

                    // 2. 重写鼠标交互方法 (Mouse Interaction)
                    // 拦截点击事件，阻止默认的文本编辑器，改为弹出提示框
                    widget.mouse = function (e, pos, node) {
                        if (e.type === "pointerdown") {
                            // 使用浏览器原生的 prompt 弹窗（或其他你喜欢的 UI 方式）
                            // 第二个参数留空，确保不显示当前的 Key，保证安全性
                            const newValue = prompt("Please enter your Gemini API Key (Hidden for security):", "");
                            
                            // 如果用户点击了确定 (不为 null)
                            if (newValue !== null) {
                                this.value = newValue;
                                // 触发回调通知 ComfyUI 值已变更
                                if (this.callback) {
                                    this.callback(this.value);
                                }
                            }
                            // 返回 true 表示事件已被处理，阻止 ComfyUI 默认的文本输入框弹出
                            return true; 
                        }
                    };
                }
                
                return r;
            };
        }
    },
});