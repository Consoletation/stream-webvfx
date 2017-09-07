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

		int particles = (int)((audio.volume * 20));

		m_emmiter.Emit (particles);
		m_emmiter.emit = false;

		float s = audio.volume * 2.0f;

		m_scale += (s - m_scale) * 0.1f;

		transform.localScale = new Vector3 (m_scale, m_scale, m_scale);
	}

}
