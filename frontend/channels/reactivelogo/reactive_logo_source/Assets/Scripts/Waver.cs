using UnityEngine;
using System.Collections;

public class Waver : MonoBehaviour {

	[SerializeField]
	private float m_speed = 8;
	[SerializeField]
	private float m_radius = 1;

	private Vector3 m_startPos;
	private float m_angle;
	TrailRenderer m_trail;


	void Start()
	{

		m_trail = gameObject.GetComponent<TrailRenderer> ();

		m_startPos = transform.position;
		float w = Random.Range (10, 30) / 100.0f;
		m_trail.startWidth = w;
		m_trail.endWidth = 0;
		m_trail.time = w * 4.0f;
		m_radius = w * 2;

		m_trail.material.color = Settings.GetRandomColor ();

		m_speed = Random.Range (8, 15);


	}
	void Update () {


		Vector3 posTo = transform.position;
		posTo.x += 0.1f;
		posTo.y = m_startPos.y + Mathf.Sin (m_angle * Mathf.Deg2Rad) * 1f;

		transform.position = posTo;

		m_angle += m_speed;
	}
}
