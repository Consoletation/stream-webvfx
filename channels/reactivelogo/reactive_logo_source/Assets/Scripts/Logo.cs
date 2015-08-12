using UnityEngine;
using System.Collections;

public class Logo : MonoBehaviour , ISoundReact{

	private ParticleEmitter m_emmiter;



	void Start () {

		m_emmiter = transform.GetChieldFromName <ParticleEmitter>("m_emmiter");

		m_emmiter.emit = false;

		SoundReactive.RegisterListener (this);
	}

	private float m_scale = 0;

	public void AudioHandle(AudioData audio)
	{
		int particles = (int)(audio.normalSpectrum / 2.0f);

		m_emmiter.Emit (particles);
		m_emmiter.emit = false;

		float s = audio.normalSpectrum / 5.0f;

		s = Mathf.Clamp (s, 0.8f, 2.0f);

		m_scale += (s - m_scale) * 0.1f;

		transform.localScale = new Vector3 (m_scale, m_scale, m_scale);
	}

}
