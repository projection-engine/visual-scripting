export default {
    static: `#version 300 es
        precision highp float;
      
        in vec3 vNormal;
        in mat4 normalMatrix;
        in mat3 toTangentSpace;
        in vec3 viewDirection;
        in vec2 texCoord;
        in vec3 vPosition;
        uniform float elapsedTime;
        uniform sampler2D brdfSampler;
        uniform samplerCube irradianceMap;
        uniform samplerCube prefilteredMapSampler;
        uniform float ambientLODSamples;
        const float PI = 3.14159265359;
        layout (location = 0) out vec4 gPosition;
        layout (location = 1) out vec4 gNormal;
        layout (location = 2) out vec4 gAlbedo;
        layout (location = 3) out vec4 gBehaviour;
        layout (location = 4) out vec4 gAmbient;
        
        
        `,
    wrapper: (body, ambient) => `
    
        ${ambient ? '@import(fresnelSchlickRoughness)' : ''}
    
        void main(){
            gPosition = vec4(vPosition, 1.);
            ${body}
           ${ambient ? `
            vec3 diffuse = vec3(0.);
            vec3 specular = vec3(0.);
            
            vec3 V = normalize(cameraVec - vPosition.xyz);
            float NdotV    = max(dot(gNormal.rgb, V), 0.000001);
            vec3 F0 = mix(vec3(0.04), albedoTexture.rgb, gBehaviour.b);
            
            vec3 F    = fresnelSchlickRoughness(NdotV, F0, gBehaviour.g);
            vec3 kD = (1.0 - F) * (1.0 - gBehaviour.b);
            diffuse = texture(irradianceMap, vec3(gNormal.x, -gNormal.y, gNormal.z)).rgb * gAlbedo.rgb * kD;
        
       
            vec3 prefilteredColor = textureLod(prefilteredMapSampler, reflect(-V, gNormal.rgb), gBehaviour.g * ambientLODSamples).rgb;
            vec2 brdf = texture(brdfSampler, vec2(NdotV, gBehaviour.g)).rg;
            specular = prefilteredColor * (F * brdf.r + brdf.g);
  
            gAmbient = vec4((diffuse + specular) * gBehaviour.r, 1.);
            ` : ''} 
        }
        `,
    inputs: ``,
    functions: ``
}