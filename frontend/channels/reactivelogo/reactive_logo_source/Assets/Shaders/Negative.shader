Shader "Hidden/Negative" {
Properties {
	_MainTex ("Base (RGB)", 2D) = "white" {}
}

SubShader {
	Pass {
		ZTest Always Cull Off ZWrite Off
				
CGPROGRAM
#pragma vertex vert_img
#pragma fragment frag
#include "UnityCG.cginc"

uniform sampler2D _MainTex;
uniform sampler2D _PictTexture;
uniform float _Negative;
uniform int _UsePicture;

fixed4 frag (v2f_img i) : SV_Target
{	
	fixed4 original = tex2D(_MainTex, i.uv);
	fixed4 picture = tex2D(_PictTexture, i.uv);
	
	float pr =  picture.r ;
    float pg = picture.g ;
    float pb = picture.b ;
	
	float r =  original.r ;
    float g = original.g ;
    float b = original.b ;
    
    
    float nr = _Negative - r ;
    float ng = _Negative- g ;
    float nb = _Negative- b ;
    
    if(nr < 0)
    	nr = -nr ;
    if(ng <0)
    	ng = -ng ;
    if(nb <0)
    	nb = -nb ;
    	
    	
   	float nrP = _Negative - pr ;
    float ngP = _Negative- pg ;
    float nbP = _Negative- pb ;
    
    if(nrP < 0)
    	nrP = -nrP ;
    if(ngP <0)
    	ngP = -ngP ;
    if(nbP <0)
    	nbP = -nbP ;
 
 	
	fixed4 output = float4(nr,ng,nb,1.0);
	
	
	if(_UsePicture == 1 && r < 0.5 && g < 0.5 && b < 0.5)
		output = float4(nrP,ngP,nbP,1);
	
	return output;
}
ENDCG

	}
}

Fallback off

}
