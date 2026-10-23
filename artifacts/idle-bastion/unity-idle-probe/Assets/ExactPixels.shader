Shader "SpireProbe/ExactPixels" {
    Properties { _MainTex ("Rest image", 2D) = "white" {} }
    SubShader {
        Tags { "Queue"="Transparent" }
        Pass {
            Cull Off ZWrite Off Blend Off
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct Input { float4 vertex : POSITION; float2 uv : TEXCOORD0; };
            struct Output { float4 vertex : SV_POSITION; float2 uv : TEXCOORD0; };
            sampler2D _MainTex;
            Output vert(Input v) {
                Output o; o.vertex = UnityObjectToClipPos(v.vertex); o.uv = v.uv; return o;
            }
            fixed4 frag(Output v) : SV_Target { return tex2D(_MainTex, v.uv); }
            ENDCG
        }
    }
}
