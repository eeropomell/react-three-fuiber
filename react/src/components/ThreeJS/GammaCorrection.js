import React, { forwardRef, useMemo } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'

// Gamma correction fragment shader
const fragmentShader = `
  uniform float param;  // Gamma value

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 color = inputColor;
    // Apply gamma correction
    color.rgb = pow(color.rgb, vec3(1.0 / param));
    outputColor = color;
  }
`

let _uParam

// Custom Gamma Correction Effect implementation
class GammaCorrectionEffectImpl extends Effect {
  constructor({ param = 2.2 } = {}) { // Default gamma value is 2.2
    super('GammaCorrectionEffect', fragmentShader, {
      uniforms: new Map([['param', new Uniform(param)]])
    })

    _uParam = param
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('param').value = _uParam
  }
}

// Gamma Correction Effect component
export const GammaCorrectionEffect = forwardRef(({ param = 2.2 }, ref) => {
  const effect = useMemo(() => new GammaCorrectionEffectImpl({ param }), [param])
  return <primitive ref={ref} object={effect} dispose={null} />
})
